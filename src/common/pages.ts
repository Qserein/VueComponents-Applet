import { reactive } from 'vue'

export type PageItem = {
  id: number
}

export function usePages<T extends PageItem[]>(pages: T): T
export function usePages<T extends PageItem>(pages: T[]): T[]
export function usePages<T extends PageItem[]>(pages: T): T {
  return reactive(pages) as T
}
