import { Ref, ref, watch } from 'vue'

/** 中断后续操作， 永远不会结束的异步等待 */
export function abort() {
  return new Promise(() => {})
}

/** 异步等待时间 */
export function delay(time: number) {
  return new Promise(ok => setTimeout(ok, time))
}

/** 构造元组 */
export function tuple<T extends any[]>(...a: T): T {
  return a
}

/** 显示土司提示 */
export function toast(title: string, icon: 'success' | 'loading' | 'error' | 'none' = 'none', option?: Parameters<typeof uni.showToast>[0]) {
  return uni.showToast({
    icon,
    title,
    ...(option ?? {}),
  })
}

/** 防抖 */
export function debounce<T, A extends any[]>(time: number, fn: (this: T, ...args: A) => void) {
  let timeout: any = null
  return function (this: T, ...args: A) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      fn.call(this, ...args)
    }, time)
  }
}

/** 不定长唯一 id */
export function unid() {
  return `${(+new Date()).toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function useBind<T>(inv: () => T, emit: (v: T) => void) {
  const val: Ref<T> = ref(inv() as any)
  watch(inv, v => {
    val.value = v as T
  })
  watch(val, v => {
    emit(v)
  })
  return val
}
