import { reactive } from 'vue'
import { UserApi } from './api/gen/main/types/Login'
import { merge } from './common/merge'

function newUser(): UserApi {
  return {
    ID: 0,
    /** 用户名 */
    UserName: '',
    /** 昵称 */
    NickName: '',
    /** 联系人 */
    FullName: '',
    openid: '',
    token: '',
    State: 0,
    Remarks: '',
    IsCertification: false,
    /** 手机号码 */
    Phone: '',
    HeadPortrait: '',
    /** 添加时间 */
    AddDate: '',
    /** 地址 */
    Areas: '',
    /** 推荐人名称 */
    ReferrerName: '',
    /** 角色名称 */
    RoleNames: '',
    /** 角色类型 */
    RoleID: 4,
    /** 上级用户 */
    Referrer: 0,
    /** 上级角色 */
    ReferrerRoleID: 0,
  }
}

class Store {
  token = ''
  reload: Record<string, boolean> = {}

  tmp: Record<string, any> = {}

  user = newUser()

  load() {
    merge(store, uni.getStorageSync('store'))
    store.loadToken()
  }
  save() {
    const data = {
      ...store,
    }
    delete (data as any).reload
    delete (data as any).tmp
    delete (data as any).token
    uni.setStorageSync('store', data)
    store.saveToken()
  }
  loadToken() {
    store.token = uni.getStorageSync('token')
  }
  saveToken() {
    uni.setStorageSync('token', store.token)
  }

  islogined() {
    return !!store.token
  }

  logout() {
    this.token = null!
    this.user = newUser()
    this.save()
  }
}

export let store = reactive(new Store())

store.load()
store.save()
