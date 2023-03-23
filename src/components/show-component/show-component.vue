<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: '',
  }
)
</script>

<template>
  <div class="component-box">
    <div class="component-title">{{ label }}</div>
    <div class="component-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.component-box {
  width: 100%;
  > .component-title {
    font-size: 30rpx;
    font-weight: 500;
    padding: 10rpx;
    grid-column: span 2 / span 2;
    min-height: 80rpx;
    display: grid;
    align-items: center;
  }
  > .component-content {
    display: grid;
    align-items: center;
    min-height: 80rpx;
    padding: 10rpx;
    background: #fff;
  }
}
</style>
