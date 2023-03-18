export type Paged = {
  reget: boolean
  index: number
  last: number
  count: number
  hasNextPage: boolean
}

export function defaultPaged(): Paged {
  return {
    reget: false,
    index: 1,
    last: 0,
    count: 0,
    hasNextPage: true,
  }
}

type ApiResultPage = {
  /** 是否成功 */
  success: boolean
  /** 信息 */
  msg?: string
  /** 分页页码 */
  index: number
  /** 分页的总数据 */
  count: number
  /** 每页数量 */
  size: number
  /** 总页数 */
  pages: number
  /** 是否有下一页 */
  hasNextPage: boolean
}

export namespace Paged {
  /** 初始化分页，返回 true 将取消请求 */
  export function init(page: Paged, reget = false) {
    if (reget) {
      page.reget = true
      page.index = 1
      page.last = 0
    } else {
      if (!page.hasNextPage) return true
      if (page.index == page.last) return true
    }
  }
  /** 完成分页 */
  export function ok(page: Paged, r: ApiResultPage) {
    page.reget = false
    page.count = r.count
    page.hasNextPage = r.hasNextPage
    page.last = page.index
    if (r.hasNextPage) {
      page.index++
    }
  }
}
