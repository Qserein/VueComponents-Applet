import 'url-search-params-polyfill'
import './utils.scss'
import { createSSRApp } from 'vue'
import App from './App.vue'
import './store'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  return {
    app,
  }
}
