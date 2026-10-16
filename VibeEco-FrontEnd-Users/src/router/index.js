import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/LoginView.vue'
import EsqueciSenha from '@/views/EsqueciSenhaView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tela-acesso', component: Login },
    { path: '/esqueci-senha', name: 'esqueci-senha', component: EsqueciSenha }
  ]
})

export default router