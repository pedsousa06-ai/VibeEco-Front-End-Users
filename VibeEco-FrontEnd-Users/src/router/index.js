import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/LoginView.vue'
import EsqueciSenha from '@/views/EsqueciSenhaView.vue'
import PrimeiroAcesso from '@/views/PrimeiroAcessoView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tela-acesso', component: Login },
    { path: '/esqueci-senha', name: 'esqueci-senha', component: EsqueciSenha },
    { path: '/primeiro-acesso', name: 'primeiro-acesso', component: PrimeiroAcesso }
  ]
})

export default router