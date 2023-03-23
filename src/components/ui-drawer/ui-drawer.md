<h3 align="center" style="margin: 30px 0 30px;font-weight: bold;font-size:40px;">ui-drawer</h3>
<h3 align="center">抽屉弹窗组件</h3>

# 说明

- 此组件仅适用于此模板项目，因为其他平台没有做测试，兼容会在下方标注

<br>

# 平台兼容性

| Vue2 | Vue3 |
| :--: | :--: |
|  √   |  √   |

| 微信小程序 | 支付宝小程序 | 百度小程序 | QQ 小程序 |
| :--------: | :----------: | :--------: | :-------: |
|     √      |      √       |    未测    |   未测    |

# 使用方法

放入项目的组件库下

```typescript
import UiDrawer from '../../components/ui-drawer/ui-drawer.vue'
import { useOpener } from '../../common/opener'

/** 控制弹窗的对象 */
const showDrawer = reactive({
  show: useOpener(false),
})
```

```html
<template>
  <div>
    <div @click="showDrawer.show.open()">点击打开抽屉</div>
    <UiDrawer :show="showDrawer.show" title="这里是弹窗标题"> 测试内容 </UiDrawer>
  </div>
</template>
```

# 属性列表

|    属性名    |  类型   |      描述      | 默认值 |
| :----------: | :-----: | :------------: | :----: |
|    title     | string  |   抽屉的标题   |        |
|     show     | Opener  | 控制弹窗的对象 |        |
|      z       | number  |    弹窗层级    |  1000  |
| maskClosable | boolean |  点击蒙层关闭  |  true  |

# 注意事项

- 要引入 useOpener 对象才可以使用

# 更新日志

## [1.0] - <2023-3-23>

### 新增

- 1.0 版本,更新组件，增加点击蒙层不关闭抽屉

# 版权信息

此组件遵循[MIT](https://en.wikipedia.org/wiki/MIT_License)开源协议，意味着您无需支付任何费用，也无需授权，即可将此项目的组件应用到您的产品中。

<br>

# 隐私、权限声明

1. 本组件需要申请的系统权限列表：
   <br>
   无
2. 本组件采集的数据、发送的服务器地址、以及数据用途说明：
   <br>
   插件不采集任何数据
