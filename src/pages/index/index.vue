<script setup lang="ts">
import { ref } from 'vue'
import PickRegions from '../../components/pick-regions/pick-regions.vue'
import showComponent from '../../components/show-component/show-component.vue'

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
//#endregion
</script>

<template>
  <div class="index grid">
    <div class="list">
      <showComponent label="选择省市区：">
        <div class="pick-regions">
          <div class="label">所在地区</div>
          <!-- #ifdef MP-ALIPAY -->
          <!-- <div class="dq-box" @click="addAcrt.show.open()">
          <div class="placeholder" v-if="!editItem.Address2">选择省/市/区</div>
          <div v-else class="addres_css">{{ editItem.Address2 }}</div>
          <image class="more" src="../../static/my/licon.png" mode="aspectFill" />
        </div>
        <UiDrawer :show="addAcrt.show" title="选择地区">
          <PickRegions @getRegion="handleGetRegion" :defaultRegion="(editItem.Address2Number || []).length >= 2 ? editItem.Address2Number![2] : null">
          </PickRegions>
        </UiDrawer> -->

          <!--  #endif -->

          <!-- #ifdef MP-WEIXIN -->
          <PickRegions @getRegion="handleGetRegion" :defaultRegion="(AddressNumber || []).length >= 2 ? AddressNumber![2] : null">
            <div class="dq-box">
              <div class="placeholder" v-if="!Address">选择省/市/区</div>
              <div v-else class="addres_css">{{ Address }}</div>
              <image class="more" src="../../static/my/licon.png" mode="aspectFill" />
            </div>
          </PickRegions>
          <!--  #endif -->
        </div>
      </showComponent>
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
</style>
