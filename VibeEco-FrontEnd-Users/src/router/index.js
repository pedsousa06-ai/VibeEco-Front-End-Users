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
import Missoes from '@/views/MissoesView.vue'
import MissaoDetalhe from '@/views/MissaoDetalheView.vue'
import Conteudos from '@/views/ConteudosView.vue'
import ConteudosDetalhe from '@/views/ConteudosDetalhesView.vue'
import Feed from '@/views/FeedView.vue'
import Ranking from '@/views/RankingView.vue'
import Configuracoes from '@/views/ConfiguracoesView.vue'
import Recompensas from '@/views/RecompensasView.vue'
import Notificacoes from '@/views/NotificacoesView.vue'
import Historico from '@/views/HistoricoView.vue'
import Desafios from '@/views/DesafiosView.vue'
import DesafioDetalhe from '@/views/DesafioDetalheView.vue'

// Telas do menu que ainda não foram feitas: usam a tela "Em breve".
// Quando uma ficar pronta, troque o component dela e remova-a desta lista.

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
        { path: 'conteudos', name: 'conteudos', component: Conteudos, meta: { titulo: 'Biblioteca de conteúdos' } },
        {
          path: 'conteudos/:id',
          name: 'conteudo-detalhe',
          component: ConteudosDetalhe,
          meta: { titulo: 'Biblioteca de conteúdos' },
        },
        { path: 'feed', name: 'feed', component: Feed, meta: { titulo: 'Feed da Comunidade' } },
        { path: 'ranking', name: 'ranking', component: Ranking, meta: { titulo: 'Ranking' } },
        { path: 'configuracoes', name: 'configuracoes', component: Configuracoes, meta: { titulo: 'Configurações' } },
        { path: 'recompensas', name: 'recompensas', component: Recompensas, meta: { titulo: 'Recompensas' } },
        { path: 'notificacoes', name: 'notificacoes', component: Notificacoes, meta: { titulo: 'Notificações' } },
        { path: 'historico', name: 'historico', component: Historico, meta: { titulo: 'Histórico' } },
        { path: 'desafios', name: 'desafios', component: Desafios, meta: { titulo: 'Desafios' } },
        { path: 'desafios/:id', name: 'desafio-detalhe', component: DesafioDetalhe, meta: { titulo: 'Desafios' } },
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