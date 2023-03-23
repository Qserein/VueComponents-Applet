import { reactive, ref } from 'vue'

export interface Opener {
  show: boolean

  /** 是否点击背景时不关闭弹窗 */
  ignoreBgClose?: boolean

  open(): void
  close(): void
}

export function useOpener(show = false, ignoreBgClose = false) {
  const opener = reactive<Opener>({
    show,
    ignoreBgClose,
    open() {
      opener.show = true
    },
    close() {
      opener.show = false
    },
  })
  return opener
}

export interface OpenBy<T> extends Omit<Opener, 'open'> {
  open(v: T): void
  val?: T
}

export function useOpenBy<T>(defv?: T, show = false) {
  const opener = reactive<OpenBy<T>>({
    show,
    val: defv,
    open(v: T) {
      opener.show = true
      // opener.val = v as any
    },
    close() {
      opener.show = false
    },
  })
  return opener
}
