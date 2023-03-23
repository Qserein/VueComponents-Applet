<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useOpener } from '../../common/opener'
import PickRegions from '../../components/pick-regions/pick-regions.vue'
import ShowComponent from '../../components/show-component/show-component.vue'
import UiDrawer from '../../components/ui-drawer/ui-drawer.vue'

//#region PickRegions选择省市区
/** 选中的地址中文 */
const Address = ref('')
/** 选中的地址编码 */
const AddressNumber = ref([])

function handleGetRegion(region: any) {
  console.log(region)
  let temp = ''
  for (const t of region) {
    temp = `${temp}/${t.name}`
  }
  temp = temp.slice(1)
  Address.value = temp
  AddressNumber.value = region.map((t: any) => t.code)
}
// #ifdef MP-ALIPAY
/** 控制支付宝端的抽屉对象 */
const showAddress = reactive({
  show: useOpener(false),
})
// #endif
//#endregion

//#region 抽屉组件
/** 控制弹窗的对象 */
const showDrawer = reactive({
  show: useOpener(false),
})
//#endregion
</script>

<template>
  <div class="index grid">
    <div class="list">
      <ShowComponent label="选择省市区：">
        <div class="pick-regions">
          <div class="label">所在地区</div>
          <!-- #ifdef MP-ALIPAY -->
          <div class="dq-box" @click="showAddress.show.open()">
            <div class="placeholder" v-if="!Address">选择省/市/区</div>
            <div v-else class="addres_css">{{ Address }}</div>
            <image class="more" src="../../static/my/licon.png" mode="aspectFill" />
          </div>
          <UiDrawer :show="showAddress.show" title="选择地区">
            <PickRegions @getRegion="handleGetRegion" :defaultRegion="(AddressNumber || []).length >= 2 ? AddressNumber![2] : null"> </PickRegions>
          </UiDrawer>
          <!--  #endif -->
          <!-- #ifdef MP-WEIXIN -->
          <PickRegions @getRegion="handleGetRegion" :defaultRegion="(AddressNumber || []).length >= 2 ? AddressNumber![2] : null">
            <div class="dq-box">
              <div class="placeholder" v-if="!Address">选择省/市/区</div>
              <div v-else class="addres_css">{{ Address }}</div>
              <image class="more" src="../../static/icons/more.svg" mode="aspectFill" />
            </div>
          </PickRegions>
          <!--  #endif -->
        </div>
      </ShowComponent>
      <ShowComponent label="下拉抽屉：">
        <div class="ui-drawer">
          <div class="ui-drawer-title" @click="showDrawer.show.open()">点击打开抽屉</div>
          <UiDrawer :show="showDrawer.show" title="这里是弹窗标题"> 测试内容 </UiDrawer>
        </div>
      </ShowComponent>
    </div>
  </div>
</template>

<style scoped lang="scss">
.index {
  background: #f3f4f6;
  grid-auto-rows: min-content;
  gap: 25rpx;
  box-shadow: inset -1px 0 1px rgba(0, 0, 0, 0.1);
  > .list {
    display: grid;
    align-content: flex-start;
  }
}

/** 选择省市区样式 */
.pick-regions {
  display: grid;
  grid-template-columns: 150rpx auto;
  align-items: center;
  > .label {
    font-size: 26rpx;
    color: #555555;
  }
  .dq-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .more {
      width: 11rpx;
      height: 20rpx;
    }
  }
  .placeholder {
    font-size: 26rpx;
    color: #a1a1a1;
  }
  .addres_css {
    font-size: 26rpx;
    color: #333333;
  }
}
/** 抽屉组件样式 */
.ui-drawer {
  > .ui-drawer-title {
    font-size: 26rpx;
    color: #333333;
  }
}
</style>
