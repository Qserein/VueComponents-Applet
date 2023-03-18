import { baseUrl } from '../config'
import { store } from '../store'

export interface ApiResult<T> {
  success: boolean
  msg?: string
  data: T
  statusCode: number
}

/** 请求类型 */
const reqType = {
  query: 'application/x-www-form-urlencoded',
  json: 'application/json',
  form: 'multipart/form-data',
}

export type Method =
  | 'OPTIONS'
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'TRACE'
  | 'CONNECT'
  | Lowercase<'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'>

export type AHttpOption = {
  type?: 'query' | 'json'
  prefix?: string
  loading?: boolean
  nores?: boolean
  baseUrl?: string
  nolog?: boolean
}

let Tokenrefresh: Promise<boolean> | undefined

/** 异步 http 请求 */
export async function ahttp<T>(url: string, data: any, query: any, method: Method, option: AHttpOption & { nores: true }): Promise<T>
export async function ahttp<T>(url: string, data: any, query: any, method?: Method, option?: AHttpOption): Promise<ApiResult<T>>
export async function ahttp<T>(url: string, data: any, query: any, method: Method = 'get', option?: AHttpOption): Promise<T> {
  const type = option?.type ?? 'json'
  const prefix = option?.prefix ?? method
  const loading = option?.loading ?? false
  const nores = option?.nores ?? false
  const base_url = option?.baseUrl ?? baseUrl
  const queryStr = new URLSearchParams(Object.entries(query ?? {})).toString()

  if (loading)
    uni.showLoading({
      mask: true,
    })
  try {
    return await new Promise(ok => {
      req()
      async function req() {
        const Authorization = store.token ? `Bearer ${store.token}` : void 0
        if (Authorization) {
          try {
            await Tokenrefresh
          } catch (_) {}
        }
        const rurl = `${base_url}${url}${queryStr ? `?${queryStr}` : ''}`
        uni.request({
          url: rurl,
          data:
            method == 'get'
              ? void 0
              : Object.fromEntries(
                  Object.entries({
                    ...data,
                  }).filter(([, v]) => v != null)
                ),
          method: method as any,
          header: {
            'Content-Type': reqType[type],
            Authorization,
          },
          success: onSuccess,
          fail: onFail,
        })
        async function onSuccess(res: UniApp.RequestSuccessCallbackResult) {
          if (res.statusCode == 200) {
            if ((res.data as any).success || nores) {
              if (!option?.nolog)
                console.info(
                  `%c${prefix}%c%s%o%o%c\n%o`,
                  'background-color: #34495e; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
                  'background-color: #4fc08d; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
                  url,
                  data,
                  query,
                  '',
                  res.data
                )
            } else {
              if (!option?.nolog)
                console.error(
                  `%c${prefix}%c%s%o%o%c\n%o`,
                  'background-color: #c63c1b; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
                  'background-color: #e45735; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
                  url,
                  data,
                  query,
                  '',
                  res.data
                )
            }
            return ok(res.data as any)
          } else if (res.statusCode == 401 && Authorization) {
            if (!Tokenrefresh) {
              Tokenrefresh = new Promise<boolean>((ok, err) => {
                uni.request({
                  url: `${base_url}/api/User/Login/Tokenrefresh`,
                  method: 'GET',
                  header: {
                    Authorization,
                  },
                  success(res) {
                    Tokenrefresh = void 0
                    if (res.statusCode == 200 && (res.data as any).success) {
                      store.token = (res.data as any).data
                      store.save()
                      ok(true)
                    } else {
                      ok(false)
                    }
                  },
                  fail(e) {
                    console.error(e)
                    err(e)
                  },
                })
              })
            }
            try {
              if (await Tokenrefresh) {
                req()
              } else {
                logErr()
              }
            } catch (_) {
              logErr()
            }
          } else {
            logErr()
          }
          function logErr() {
            console.error(
              `%c${prefix}%c%s%o%o%c\n%o`,
              'background-color: #c63c1b; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
              'background-color: #e45735; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
              url,
              data,
              query,
              '',
              res
            )
            return ok(nores ? {} : ({ success: false } as any))
          }
        }
        function onFail(e: unknown) {
          console.error(
            `%c${prefix}%c%s%o%o%c\n%o`,
            'background-color: #c63c1b; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
            'background-color: #e45735; color: #fcfcfc; border-radius: 5px; padding: 1px 5px; margin-right: 5px;',
            url,
            data,
            query,
            '',
            e
          )
          return ok(nores ? {} : ({ success: false } as any))
        }
      }
    })
  } finally {
    if (loading) uni.hideLoading()
  }
}

/** 异步 get 请求 */
export function aget<T>(url: string, query: any, option: AHttpOption & { nores: true }): Promise<T>
export function aget<T>(url: string, query?: any, option?: AHttpOption): Promise<ApiResult<T>>
export function aget(url: string, query?: any, option?: AHttpOption): Promise<any> {
  return ahttp(url, void 0, query, 'get', option)
}

/** 异步 post 请求 */
export function apost<T>(url: string, data: any, query: object, option: AHttpOption & { nores: true }): Promise<T>
export function apost<T>(url: string, data?: any, query?: object, option?: AHttpOption): Promise<ApiResult<T>>
export function apost(url: string, data?: any, query?: object, option?: AHttpOption): Promise<any> {
  return ahttp(url, data, query, 'post', option)
}

/** 异步 put 请求 */
export function aput<T>(url: string, data: any, query: object, option: AHttpOption & { nores: true }): Promise<T>
export function aput<T>(url: string, data?: any, query?: object, option?: AHttpOption): Promise<ApiResult<T>>
export function aput(url: string, data?: any, query?: object, option?: AHttpOption): Promise<any> {
  return ahttp(url, data, query, 'put', option)
}

/** 异步 delete 请求 */
export function adel<T>(url: string, data: any, query: object, option: AHttpOption & { nores: true }): Promise<T>
export function adel<T>(url: string, data?: any, query?: object, option?: AHttpOption): Promise<ApiResult<T>>
export function adel(url: string, data?: any, query?: object, option?: AHttpOption): Promise<any> {
  return ahttp(url, data, query, 'delete', option)
}

/** 异步 patch 请求 */
export function apatch<T>(url: string, data: any, query: object, option: AHttpOption & { nores: true }): Promise<T>
export function apatch<T>(url: string, data?: any, query?: object, option?: AHttpOption): Promise<ApiResult<T>>
export function apatch(url: string, data?: any, query?: object, option?: AHttpOption): Promise<any> {
  return ahttp(url, data, query, 'patch' as any, option)
}

/** 参数对象 */
export type QueryParams = Record<string, unknown> | unknown[]

/** 构建查询字符串, 不包含 ? */
export function buildFormData(params: QueryParams): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(params)) {
    switch (typeof v) {
      case 'bigint':
      case 'boolean':
      case 'number':
        fd.append(k, `${v}`)
        break
      case 'string':
        fd.append(k, v)
        break
      case 'undefined':
        break
      case 'object':
        if (v == null) break
        else if (v instanceof Date) fd.append(k, v.toString())
        else if (v instanceof File) fd.append(k, v, v.name)
        else if (v instanceof Blob) fd.append(k, v)
        else fd.append(k, JSON.stringify(v))
    }
  }
  return fd
}
