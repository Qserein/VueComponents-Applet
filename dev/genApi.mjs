// @ts-check
import dayjs from 'dayjs'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import 'colors'
import { seq, tuple } from 'libsugar'

const apiDir = './src/api/gen/'
const ahttpPath = '../../../common/http'

/** @typedef {{ baseUrl: string, defines: string[] }} ApiGroup */

/** @type {Record<string, (o: ApiGroup) => void>} */
const groups = {
  main(o) {
    o.baseUrl = 'http://192.168.1.85:8005'
    o.baseUrl = 'http://localhost:4573'
    o.defines = ['Login', 'User', 'Common', 'NoGroup']
  },
}

await genGroups()
await genIndex()
console.log(log_prefix(), 'all end'.blue)

async function genGroups() {
  await Promise.all(Object.entries(groups).map(([k, g]) => genGroup(k, g)))
}

async function genIndex() {
  const imports = Object.entries(groups).map(([k]) => `import * as _${k} from './${k}/api'`)
  const apis = Object.entries(groups).map(([k]) => `export const ${k} = _${k}`)

  const code = [...imports, `\n/** 接口 */`, `  export namespace api {`, ...apis, '}\n'].join('\n')

  const apipath = `${apiDir}/index.ts`
  await writeCode(apipath, code)
}

/** @param {string} gname * @param {(o: ApiGroup) => void} gf */
async function genGroup(gname, gf) {
  /** @type {ApiGroup} */
  const g = { baseUrl: '', defines: [] }
  gf(g)
  const defs = await Promise.all(g.defines.map(downloadDefine))

  /** @param {string} def * @return {Promise<[any, string] | undefined>} */
  async function downloadDefine(def) {
    console.log(log_prefix(gname), 'get'.yellow, def)
    const url = `${g.baseUrl}/swagger/${def}/swagger.json`
    try {
      const r = await (await fetch(url)).json()
      console.log(log_prefix(gname), 'got'.blue, url)
      return [r, def]
    } catch (e) {
      console.log(log_prefix(gname), 'get'.red, url, `failed`.red)
      console.error(e)
    }
  }

  const dirPath = `${apiDir}/${gname}/`

  await fs.mkdir(`${dirPath}/types/`, { recursive: true })

  const apiSchemasImports = new Map()
  const aImports = new Set()

  const items = {}

  let defi = -1
  for (const rd of defs) {
    if (!rd) continue
    const [r, def] = rd
    const defn = def
    defi++
    const schemas = Object.entries(r.components?.schemas ?? {})
      .map(([k, s]) => {
        const description = (s.description && `/** ${s.description.replace('*/', '*')} */\n`) || ''
        // console.log(s)
        if (s.type == 'integer') {
          if ('enum' in s) {
            if ('x-enumNames' in s) {
              const enums = []
              for (const [e, i] of [...(s.enum ?? [])].map((v, i) => [v, i])) {
                const name = s['x-enumNames']?.[i]
                let dec = s['x-enumDescriptions']?.[i]
                if (dec) dec = `  /** ${dec.replace('*/', '*')} */\n`
                enums.push({ name, value: e, dec })
              }
              return [`${description}export enum ${k} {`, ...enums.map(e => `${e.dec ?? ''}  ${e.name} = ${e.value},`), `}`].join('\n')
            } else {
              return `${description}export type ${k} = number`
            }
          } else {
            return `${description}export type ${k} = number`
          }
        } else if (s.type == 'object') {
          const properties = Object.entries(s.properties ?? {}).map(([f, p]) => {
            const strs = ['  ', (p.description && `/** ${p.description.replace('*/', '*')} */\n  `) || '']
            strs.push(f)
            if (p.nullable) {
              strs.push('?')
            }
            strs.push(': ')
            strs.push(buildType(p))
            strs.push(',')
            return strs.join('')
          })
          return `${description}export type ${k} = {\n${properties.join('\n')}\n}\n`
        }
      })
      .filter(i => i)

    for (const [path, o] of Object.entries(r.paths)) {
      for (let [method, def] of Object.entries(o)) {
        if (method === 'delete') method = 'del'
        aImports.add(method)
        const summary = def.summary ? `/** ${def.summary.replace(/ \(Auth policies: .+\)/, '').replace('*/', '*')} */` : ''
        const pathParams = []
        const defParameters = def.parameters
          ? `{\n  ${
              def.parameters
                .map(p => {
                  if (p.in == 'path') pathParams.push(p.name)
                  const description = (p.description && `/** ${p.description.replace('*/', '*')} */\n  `) || ''
                  const nullable = !p.required ? '?' : ''
                  const type = buildType(p.schema, true, defi)
                  if (isTypeRef(p.schema)) apiSchemasImports.set(defi, defn)
                  return `${description}${p.name}${nullable}: ${type}`
                })
                .join('\n  ') || ''
            }\n}`
          : ''

        const defBodySchema = def.requestBody?.content?.['application/json']?.schema
        const defBodyType = defBodySchema ? buildType(defBodySchema, true, defi) : ''
        if (defBodySchema && isTypeRef(defBodySchema)) apiSchemasImports.set(defi, defn)

        const retTypeSchema = def.responses[200]?.content?.['application/json']?.schema
        const retType = retTypeSchema ? buildType(retTypeSchema, true, defi) : 'any'
        if (retTypeSchema && isTypeRef(retTypeSchema)) apiSchemasImports.set(defi, defn)

        const methodobj = (items[method] = items[method] ?? { params: [], impl: [] })
        methodobj.params.push({ path, params: defParameters }) //TODO
        methodobj.impl.push({ summary, path, params: defParameters, body: defBodyType, ret: retType, pathParams: pathParams })
      }
    }

    const schemaspath = `${dirPath}/types/${def}.ts`
    await writeCode(schemaspath, schemas.join('\n') || 'export {}\n')
  }

  const ahttpImports = aImports.size > 0 ? `import { AHttpOption, ${[...aImports].map(i => `a${i}`).join(', ') || ''} } from '${ahttpPath}'` : ''
  const schemasImports = [...apiSchemasImports].map(([k, v]) => `import type * as d${k} from './types/${v}'`)

  const impls = seq(Object.entries(items))
    .flatMap(([method, { impl }]) => seq(impl).map(impl => tuple(method, impl)))
    .groupBy(([, impl]) => impl.path)
    .map(([path, g]) => tuple(path, g))
    .toArray()

  const params = Object.entries(items).flatMap(([method, { params }]) => {
    const def_params = params.flatMap(({ path, params }) => {
      if (!params) return []
      return [
        `  [${JSON.stringify(path)}]: ${params
          .split('\n')
          .map(i => `    ${i}`)
          .join('\n')
          .trim()}`,
      ]
    })
    const [method_head, ...method_body] = method
    const caml_method = `${method_head.toUpperCase()}${method_body.join('')}`
    const params_code = params.filter(i => i.params).length > 0 ? [`export type ${caml_method}Params = {`, ...def_params, '}'] : []
    return params_code
  })

  const apis = seq(impls)
    .flatMap(([path, impls]) => {
      const codes = impls.flatMap(([method, { summary, params, body, ret, pathParams }]) => {
        const [method_head, ...method_body] = method
        const caml_method = `${method_head.toUpperCase()}${method_body.join('')}`
        if (summary) summary = `    ${summary}`
        let args =
          [
            body ? `body: ${body}` : '',
            params ? `${pathParams.length > 0 ? `{ ${pathParams.join(', ')}, ...params }` : 'params'}: ${caml_method}Params[${JSON.stringify(path)}]` : '',
            'config?: (RequestInit & AHttpOption)',
          ]
            .filter(i => i)
            .join(', ') || ''
        const pathReplace = params && pathParams.length > 0 ? pathParams.map(i => `.replace(${JSON.stringify(`{${i}}`)}, \`\${${i}}\`)`).join('') : ''
        const reqArg = method == 'get' ? `${params ? 'params as any' : 'void 0'}` : `${body ? 'body as any' : 'void 0'}, ${params ? 'params as any' : 'void 0'}`
        const req = `a${method}(${JSON.stringify(path)}${pathReplace}, ${reqArg}, config) as any`
        return [summary, `    ${method}: (${args}) : Promise<${ret}> => ${req},`]
      })
      return [`  [${JSON.stringify(path)}]: {`, ...codes, '  },']
    })
    .toArray()

  const apicode = [...params, `export const api = {`, ...apis, `}`].join('\n') || ''

  const imports = [ahttpImports, ...schemasImports].filter(i => i).join('\n') || ''
  const api = `${imports}${imports ? '\n\n' : ''}${apicode || 'export {}\n'}`

  const apipath = `${dirPath}/api.ts`
  await writeCode(apipath, api)

  console.log(log_prefix(gname), 'write'.green)
}

function buildType(p, d, di) {
  if (p.type == 'string') {
    if (p.format == 'date-time') return 'string | Date'
    else return 'string'
  } else if (p.type == 'integer' || p.type == 'number') return 'number'
  else if (p.type == 'boolean') return 'boolean'
  else if (p.type == 'array') return `${buildType(p.items, d, di)}[]`
  else if ('$ref' in p) return `${d ? `d${di ?? ''}.` : ''}${p.$ref.split('/').reverse()[0]}`
  else return 'any'
}

function isTypeRef(p) {
  return '$ref' in p
}

async function writeCode(patch, code) {
  const fh = await fs.open(patch, 'w+')
  try {
    await fh.write(code)
  } finally {
    await fh.close()
  }
}

/** @param {string | undefined} gname */
function log_prefix(gname = void 0) {
  return `[${dayjs().format('HH:mm:ss.SSS')}]`.cyan + (gname ? `[${gname}]`.green : '')
}
