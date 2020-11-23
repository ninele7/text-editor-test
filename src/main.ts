import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'prosemirror-view/style/prosemirror.css'

createApp(App).use(store).use(router).mount('#app')
