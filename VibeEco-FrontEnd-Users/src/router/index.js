import { createRouter, createWebHistory } from 'vue-router'
import { estaLogado } from '@/services/auth'
import { recuperacao } from '@/services/recuperacaoSenha'

import Login from '@/views/LoginView.vue'
import EsqueciSenha from '@/views/EsqueciSenhaView.vue'
import VerificarCodigo from '@/views/VerificarCodigoView.vue'
import NovaSenha from '@/views/NovaSenhaView.vue'
import PrimeiroAcesso from '@/views/PrimeiroAcessoView.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import Inicio from '@/views/InicioView.vue'
import EmBreve from '@/views/EmBreveView.vue'
import Missoes from '@/views/MissoesView.vue'
import MissaoDetalhe from '@/views/MissaoDetalheView.vue'
import Conteudos from '@/views/ConteudosView.vue'
import ConteudosDetalhe from '@/views/ConteudosDetalhesView.vue'


// Telas do menu que ainda não foram feitas: usam a tela "Em breve".
// Quando uma ficar pronta, troque o component dela e remova-a desta lista.
const telasEmBreve = [
  ['feed', 'Feed da Comunidade'],
  ['ranking', 'Ranking'],
  ['desafios', 'Desafios'],
  ['recompensas', 'Recompensas'],
  ['notificacoes', 'Notificações'],
  ['historico', 'Histórico'],
  ['configuracoes', 'Configurações'],
].map(([path, titulo]) => ({ path, name: path, component: EmBreve, meta: { titulo } }))

/*
  Fluxo de acesso:
    Login ──(entrar)──────────────────────────────▶ Início
      ├─ "Esqueci minha senha" ▶ Esqueci senha ▶ Insira o código ▶ Nova senha ▶ Login
      └─ "Primeiro acesso"     ▶ Primeiro acesso ───────────────────────────▶ Login
*/
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Telas públicas (quem já está logado é mandado ao Início)
    { path: '/', name: 'tela-acesso', component: Login, meta: { soVisitante: true } },
    { path: '/esqueci-senha', name: 'esqueci-senha', component: EsqueciSenha, meta: { soVisitante: true } },
    {
      path: '/verificar-codigo',
      name: 'verificar-codigo',
      component: VerificarCodigo,
      meta: { soVisitante: true, etapa: 'codigo' },
    },
    {
      path: '/nova-senha',
      name: 'nova-senha',
      component: NovaSenha,
      meta: { soVisitante: true, etapa: 'nova-senha' },
    },
    { path: '/primeiro-acesso', name: 'primeiro-acesso', component: PrimeiroAcesso, meta: { soVisitante: true } },

    // Área interna (exige login)
    {
      path: '/',
      component: AppLayout,
      meta: { requerLogin: true },
      children: [
        { path: 'inicio', name: 'inicio', component: Inicio, meta: { titulo: 'Início' } },
        { path: 'missoes', name: 'missoes', component: Missoes, meta: { titulo: 'Missões' } },
        { path: 'missoes/:id', name: 'missao-detalhe', component: MissaoDetalhe, meta: { titulo: 'Missões' } },
        ...telasEmBreve,
      ],
    },

    // Endereço inexistente: volta para o início do fluxo
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const logado = estaLogado()

  // Área interna sem login: vai ao login e lembra para onde ia
  if (to.meta.requerLogin && !logado) {
    return { name: 'tela-acesso', query: { redirect: to.fullPath } }
  }
  // Já logado não precisa ver login, recuperação ou primeiro acesso
  if (to.meta.soVisitante && logado) return { name: 'inicio' }

  // Recuperação de senha: não dá para pular etapas pela barra de endereço
  if (to.meta.etapa === 'codigo' && !recuperacao.email) {
    return { name: 'esqueci-senha' }
  }
  if (to.meta.etapa === 'nova-senha' && !recuperacao.codigoVerificado) {
    return { name: recuperacao.email ? 'verificar-codigo' : 'esqueci-senha' }
  }
  return true
})

export default router
