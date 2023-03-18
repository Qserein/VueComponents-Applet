<h3 align="center" style="margin: 30px 0 30px;font-weight: bold;font-size:40px;">pick-regions</h3>
<h3 align="center">省市区三级联动选择器</h3>

# 说明

- 此组件仅适用于此模板项目，因为其他平台没有做测试，兼容会在下方标注
- 地区数据来源[regions.json](../pick-regions/regions.json)

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
import PickRegions from '../../../components/pick-regions/pick-regions.vue'

/** 北京市/市辖区/东城区  默认地区编号 */
const defaultRegion = 110101

function handleGetRegion(region: any) {
  console.log(region)
}
```

```html
<template>
  <!-- #ifdef MP-WEIXIN -->
  <PickRegions @getRegion="handleGetRegion" :defaultRegion="defaultRegion">
    <div>点击选择省/市/区</div>
  </PickRegions>
  <!--  #endif -->

  <!-- #ifdef MP-ALIPAY -->
  <UiDrawer :show="addAcrt.show" title="选择地区">
    <PickRegions @getRegion="handleGetRegion" :defaultRegion="defaultRegion"></PickRegions>
  </UiDrawer>
  <!--  #endif -->
</template>
```

# 注意事项

- 在支付宝小程序端需要使用弹窗组件 UiDrawer 才能实现底部弹出选择,也可以选择别的弹窗组件

# 更新日志

## [1.0] - <2023-3-18>

### 新增

- 1.0 版本,兼容了支付宝小程序端

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
