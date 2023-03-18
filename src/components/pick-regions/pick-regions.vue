<template>
  <!-- #ifdef MP-WEIXIN-->
  <picker mode="multiSelector" :value="multiIndex" :range="multiArray" @change="handleValueChange" @columnchange="handleColumnChange">
    <slot></slot>
  </picker>
  <!--  #endif -->
  <!-- #ifdef MP-ALIPAY -->
  <!-- <picker onChange="handleValueChange" :value="multiIndex" :range="multiArray">
    <slot></slot>
  </picker> -->
  <picker-view :value="multiIndex" @change="handleValueChange">
    <picker-view-column v-for="t in multiArray">
      <view v-for="a in t">{{ a }}</view>
    </picker-view-column>
  </picker-view>
  <!--  #endif -->
</template>

<script>
import CHINA_REGIONS from './regions.json'

export default {
  props: {
    defaultRegions: {
      type: Array,
      default() {
        return []
      },
    },
    defaultRegionCode: {
      type: String,
    },
    defaultRegion: [String, Array],
  },
  data() {
    return {
      cityArr: CHINA_REGIONS[0].childs,
      districtArr: CHINA_REGIONS[0].childs[0].childs,
      multiIndex: [0, 0, 0],
      tempMultiIndex: [0, 0, 0],
      isInitMultiArray: true,
    }
  },
  watch: {
    defaultRegion: {
      handler(region, oldRegion) {
        if (Array.isArray(region)) {
          // 避免传的是字面量的时候重复触发
          oldRegion = oldRegion || []
          if (region.join('') !== oldRegion.join('')) {
            this.handleDefaultRegion(region)
          }
        } else if (region && region.length == 6) {
          this.handleDefaultRegion(region)
        } else {
          console.warn('defaultRegion非有效格式')
        }
      },
      immediate: true,
    },
    // #ifdef MP-ALIPAY
    multiIndex: {
      handler() {
        let col = 0
        let row = 0
        if (this.multiIndex[0] != this.tempMultiIndex[0]) {
          col = 0
          row = this.multiIndex[0]
          this.multiIndex[1] = 0
          this.multiIndex[2] = 0
        } else if (this.multiIndex[1] != this.tempMultiIndex[1]) {
          col = 1
          row = this.multiIndex[1]
          this.multiIndex[2] = 0
        } else if (this.multiIndex[2] != this.tempMultiIndex[2]) {
          col = 2
          row = this.multiIndex[2]
        }
        let e = {
          detail: { column: col, value: row },
        }
        this.handleColumnChange(e)
      },
    },
    // #endif
  },
  computed: {
    multiArray() {
      return this.pickedArr.map(arr => arr.map(item => item.name))
    },
    pickedArr() {
      // 进行初始化
      if (this.isInitMultiArray) {
        return [CHINA_REGIONS, CHINA_REGIONS[0].childs, CHINA_REGIONS[0].childs[0].childs]
      }
      return [CHINA_REGIONS, this.cityArr, this.districtArr]
    },
  },
  methods: {
    handleColumnChange(e) {
      const that = this
      let col = e.detail.column
      let row = e.detail.value
      that.multiIndex[col] = row
      console.log(that.multiIndex)
      try {
        that.isInitMultiArray = false
        switch (col) {
          case 0:
            if (CHINA_REGIONS[that.multiIndex[0]].childs.length == 0) {
              that.cityArr = that.districtArr = [CHINA_REGIONS[that.multiIndex[0]]]
              break
            }
            that.cityArr = CHINA_REGIONS[that.multiIndex[0]].childs
            that.districtArr = CHINA_REGIONS[that.multiIndex[0]].childs[that.multiIndex[1]].childs
            break
          case 1:
            that.districtArr = CHINA_REGIONS[that.multiIndex[0]].childs[that.multiIndex[1]].childs
            break
          case 2:
            break
        }
      } catch (e) {
        that.districtArr = CHINA_REGIONS[that.multiIndex[0]].childs[0].childs
      }
      // #ifdef MP-ALIPAY
      let [arr0, arr1, arr2] = this.pickedArr
      let [index0, index1, index2] = this.multiIndex
      let address = [arr0[index0], arr1[index1], arr2[index2]]
      this.$emit('getRegion', address)
      // #endif
    },
    handleValueChange(e) {
      // 结构赋值
      let [index0, index1, index2] = e.detail.value
      let [arr0, arr1, arr2] = this.pickedArr
      let address = [arr0[index0], arr1[index1], arr2[index2]]
      // #ifdef MP-ALIPAY
      this.tempMultiIndex = this.multiIndex
      this.multiIndex = [index0, index1, index2]
      // #endif
      // #ifdef MP-WEIXIN
      this.$emit('getRegion', address)
      // #endif
    },
    handleDefaultRegion(region) {
      const isCode = !Array.isArray(region)
      this.isInitMultiArray = false
      let children = CHINA_REGIONS
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < children.length; j++) {
          let condition = isCode ? children[j].code == region.slice(0, (i + 1) * 2) : children[j].name.includes(region[i])
          if (condition) {
            // 匹配成功进行赋值
            // console.log(i,j,children.length-1);
            children = children[j].childs
            if (i == 0) {
              this.cityArr = children
            } else if (i == 1) {
              this.districtArr = children
            }
            this.$set(this.multiIndex, i, j)
            // console.log(this.multiIndex);
            break
          } else {
            // 首次匹配失败就用默认的初始化
            // console.log(i,j,children.length-1);
            if (i == 0 && j == children.length - 1) {
              this.isInitMultiArray = true
            }
          }
        }
      }
    },
  },
}
</script>
