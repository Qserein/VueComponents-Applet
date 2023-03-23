<script setup lang="ts">
import { computed } from 'vue'
import { Opener } from '../../common/opener'

const props = withDefaults(
  defineProps<{
    title?: string
    show?: Opener
    z?: number
    maskClosable?: boolean
  }>(),
  {
    z: 1000,
    maskClosable: true,
  }
)

const emit = defineEmits<{
  (type: 'close'): void
}>()

const reshow = computed(() => props.show?.show ?? false)

function close() {
  props.show?.close()
  emit('close')
}
</script>

<template>
  <div class="ui-drawer-bg grid" :class="{ show: reshow }" @click.stop="maskClosable ? close() : null">
    <div class="ui-drawer grid" @click.stop>
      <div class="close" @click="close()"></div>
      <div class="top grid" v-if="title">
        <div class="title grid">{{ title }}</div>
      </div>
      <div class="box">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-drawer-bg {
  z-index: v-bind(z);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.25s;

  &:not(.show) {
    opacity: 0;
    pointer-events: none;

    > .ui-drawer {
      transform: translate(0, 100%);
    }
  }

  > .ui-drawer {
    align-self: flex-end;
    grid-template-rows: auto 1fr;
    width: 100%;
    background: #fff;
    transition: transform 0.25s;
    border-radius: 50rpx 50rpx 0rpx 0rpx;
    max-height: 80%;
    min-height: 200rpx;
    padding: 20rpx 0;
    overflow: hidden;

    > .close {
      grid-area: 1 / 1;
      z-index: 100;
      height: 0;
      display: grid;
      justify-items: flex-end;

      &::before {
        content: '';
        display: block;
        margin: 30rpx;
        width: 35rpx;
        height: 35rpx;
        background: url(../../static/icons/close.svg) center / contain no-repeat;
      }
    }
    > .top {
      grid-area: 1 / 1;
      grid-template-columns: auto 35rpx;
      align-items: center;
      padding: 30rpx;

      > .title {
        place-items: center;
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        white-space: nowrap;
      }
    }
    > .box {
      grid-area: 2 / 1;
      overflow: auto;
    }
  }
}
</style>
