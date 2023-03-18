<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

// 检查更新
function checkUpdate() {
  //#ifdef MP-WEIXIN
  // 新版本提示更新
  const updateManager = uni.getUpdateManager()
  updateManager.onCheckForUpdate(res => {
    // 请求完新版本信息的回调
    console.log('onCheckForUpdate hasUpdate', res.hasUpdate)
  })
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: ({ confirm }) => {
        if (confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      },
    })
  })
  updateManager.onUpdateFailed(() => {
    // 新版本下载失败
    uni.showModal({
      title: '已经有新版本了哟~',
      content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
    })
  })
  //#endif
}

onLaunch(() => {
  console.log('App Launch')

  checkUpdate()
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style lang="scss">
@import 'uview-plus/index.scss';
//#ifdef H5
*,
//#endif
view,
image,
button,
cover-view,
textarea,
input {
  box-sizing: border-box;
}

button::after {
  display: none;
}

page {
  min-height: 100%;
  display: grid;

  font-family: PingFang SC, Microsoft YaHei, Roboto, Noto Sans;
}

uni-toast,
uni-modal {
  z-index: 100000;
}

.skeleton-image {
  background: linear-gradient(90deg, #f3f3f3 25%, #e3e3e3 37%, #f3f3f3 63%);
  background-size: 400% 100%;
  animation: skeleton-image 1.4s ease infinite;

  &.fbfbdb {
    background-image: linear-gradient(90deg, #fbfbfb 25%, #ebebeb 37%, #fbfbfb 63%);
  }

  &.round {
    background: #f3f3f3 radial-gradient(#f3f3f3 25%, #e3e3e3 37%, #f3f3f3 63%) center / 0% no-repeat;
    animation: skeleton-image-round 1.4s ease infinite;

    &.fbfbdb {
      background-color: #fbfbfb;
      background-image: radial-gradient(#fbfbfb 25%, #ebebeb 37%, #fbfbfb 63%);
    }
  }
}

@keyframes skeleton-image {
  from {
    background-position: 100% 50%;
  }
  to {
    background-position: 0 50%;
  }
}
@keyframes skeleton-image-round {
  from {
    background-size: 0% 0%;
  }
  to {
    background-size: 300% 300%;
  }
}
</style>
