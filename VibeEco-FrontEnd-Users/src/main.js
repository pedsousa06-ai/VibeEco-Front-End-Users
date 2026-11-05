import { createApp } from 'vue'
import '@/services/configuracoes'
import router from './router'
import App from './App.vue'

createApp(App)
  .use(router)
  .mount('#app')