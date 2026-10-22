<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icone from '@/components/Icone.vue'
import { sair } from '@/services/auth'
import { usuario } from '@/services/usuario'

const route = useRoute()
const router = useRouter()

const menu = [
  { nome: 'Início', to: '/inicio', icone: 'inicio' },
  { nome: 'Missões', to: '/missoes', icone: 'alvo' },
  { nome: 'Conteúdos', to: '/conteudos', icone: 'livro' },
  { nome: 'Feed da Comunidade', to: '/feed', icone: 'usuarios' },
  { nome: 'Ranking', to: '/ranking', icone: 'trofeu' },
  { nome: 'Desafios', to: '/desafios', icone: 'raio' },
  { nome: 'Recompensas', to: '/recompensas', icone: 'presente' },
  { nome: 'Notificações', to: '/notificacoes', icone: 'sino', selo: true },
  { nome: 'Histórico', to: '/historico', icone: 'historico' },
]

const titulo = computed(() => route.meta.titulo || 'VibeEco')
const busca = ref('')
const menuAberto = ref(false)

// No celular o menu é uma gaveta: fecha ao trocar de tela ou ao apertar Esc
watch(() => route.fullPath, () => (menuAberto.value = false))
function aoApertarTecla(e) {
  if (e.key === 'Escape') menuAberto.value = false
}
onMounted(() => window.addEventListener('keydown', aoApertarTecla))
onBeforeUnmount(() => window.removeEventListener('keydown', aoApertarTecla))

function deslogar() {
  sair()
  router.push({ name: 'tela-acesso' })
}
</script>

<template>
  <div class="app">
    <a class="pular" href="#conteudo-principal">Pular para o conteúdo</a>

    <div v-if="menuAberto" class="fundo-menu" @click="menuAberto = false"></div>

    <!-- MENU LATERAL -->
    <aside class="lateral" :class="{ aberta: menuAberto }" aria-label="Menu lateral">
      <div class="lateral-logo">
        <img src="/logo-principal.png" alt="VibeEco" />
        <button type="button" class="fechar-menu" aria-label="Fechar menu" @click="menuAberto = false">
          <Icone nome="fechar" :tamanho="20" />
        </button>
      </div>

      <nav class="menu" aria-label="Navegação principal">
        <RouterLink v-for="item in menu" :key="item.to" :to="item.to" class="menu-item" active-class="ativo">
          <Icone :nome="item.icone" :tamanho="20" />
          <span>{{ item.nome }}</span>
          <span v-if="item.selo && usuario.notificacoes" class="selo" :aria-label="`${usuario.notificacoes} novas`">
            {{ usuario.notificacoes }}
          </span>
        </RouterLink>
      </nav>

      <div class="lateral-rodape">
        <div class="perfil">
          <span class="avatar avatar-grande" aria-hidden="true">{{ usuario.iniciais }}</span>
          <div>
            <strong>{{ usuario.nome }}</strong>
            <small>{{ usuario.nivel }}</small>
          </div>
        </div>

        <RouterLink to="/configuracoes" class="menu-item" active-class="ativo">
          <Icone nome="engrenagem" :tamanho="20" />
          <span>Configurações</span>
        </RouterLink>
        <button type="button" class="menu-item sair" @click="deslogar">
          <Icone nome="sair" :tamanho="20" />
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <div class="principal">
      <!-- BARRA DO TOPO -->
      <header class="topo">
        <button type="button" class="botao-menu" aria-label="Abrir menu" @click="menuAberto = true">
          <Icone nome="menu" :tamanho="22" />
        </button>

        <h1 class="topo-titulo">{{ titulo }}</h1>

        <div class="topo-acoes">
          <label class="busca">
            <Icone nome="busca" :tamanho="18" />
            <input v-model="busca" type="search" placeholder="Buscar..." aria-label="Buscar" />
          </label>

          <span class="chip chip-xp">
            <Icone nome="estrela" :tamanho="15" preenchido />
            {{ usuario.xp.toLocaleString('pt-BR') }} XP
          </span>
          <span class="chip chip-mc">
            <Icone nome="moeda" :tamanho="16" />
            {{ usuario.mc.toLocaleString('pt-BR') }} MC
          </span>

          <RouterLink to="/notificacoes" class="sino" aria-label="Notificações">
            <Icone nome="sino" :tamanho="20" />
            <span v-if="usuario.notificacoes" class="sino-ponto"></span>
          </RouterLink>

          <span class="avatar" aria-hidden="true">{{ usuario.iniciais }}</span>
        </div>
      </header>

      <main id="conteudo-principal" class="conteudo" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Cores compartilhadas com todas as telas internas (variáveis herdadas pelo <RouterView />) */
.app {
  --verde-950: #06361b;
  --verde-900: #0a4a26;
  --verde-700: #0f7a3b;
  --verde-600: #16a34a;
  --verde-500: #22c55e;
  --verde-100: #dcf5e5;
  --fundo: #f2f7f3;
  --borda: #e0eae2;
  --texto: #12261a;
  --texto-suave: #64756a;
  --largura-menu: 256px;

  min-height: 100vh;
  background: var(--fundo);
  color: var(--texto);
  font-family: 'Inter', system-ui, sans-serif;
}

.pular {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 8px;
  background: #fff;
  color: var(--texto);
  font-weight: 600;
  text-decoration: none;
  transition: top 0.15s;
}
.pular:focus {
  top: 12px;
}

/* ---------- MENU LATERAL ---------- */
.lateral {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: var(--largura-menu);
  background: linear-gradient(180deg, #0b6a35 0%, #07502a 55%, #06411f 100%);
  color: #fff;
}
.lateral-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96px;
  padding: 0 20px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.lateral-logo img {
  height: 40px;
  width: auto;
}
.fechar-menu {
  display: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
}

.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
  overflow-y: auto;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 40px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  font: inherit;
  font-size: 14.5px;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.menu-item svg {
  flex: none;
  opacity: 0.85;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu-item:focus-visible {
  outline: 2px solid #4ade80;
  outline-offset: -2px;
}
.menu-item.ativo {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 600;
  box-shadow: inset 3px 0 0 #4ade80;
}
.menu-item.ativo svg {
  color: #4ade80;
  opacity: 1;
}
.selo {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 99px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.lateral-rodape {
  padding: 12px 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px 12px;
}
.perfil strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
}
.perfil small {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #86efac;
}
.sair {
  color: #fda4af;
}
.sair:hover {
  background: rgba(239, 68, 68, 0.18);
  color: #fecdd3;
}

.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #0f7a3b);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.avatar-grande {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.35);
}

/* ---------- ÁREA PRINCIPAL ---------- */
.principal {
  margin-left: var(--largura-menu);
  min-height: 100vh;
}

.topo {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 64px;
  padding: 0 24px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--borda);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}
.topo-titulo {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
.botao-menu {
  display: none;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--borda);
  border-radius: 10px;
  background: #fff;
  color: var(--texto);
  cursor: pointer;
}
.topo-acoes {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.busca {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
  height: 38px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid var(--borda);
  border-radius: 10px;
  background: var(--fundo);
  color: var(--texto-suave);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.busca:focus-within {
  border-color: var(--verde-600);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}
.busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--texto);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
}
.chip-xp {
  border: 1px solid #f3dd9a;
  background: #fff8df;
  color: #8a5a00;
}
.chip-xp svg {
  color: #f5b301;
}
.chip-mc {
  border: 1px solid #c9e8d2;
  background: #eef9f1;
  color: #0f5b2d;
}

.sino {
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--texto-suave);
  transition: background 0.15s, color 0.15s;
}
.sino:hover {
  background: var(--fundo);
  color: var(--texto);
}
.sino:focus-visible {
  outline: 2px solid var(--verde-600);
}
.sino-ponto {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-sizing: content-box;
  background: #ef4444;
}

.conteudo {
  max-width: 1500px;
  padding: 24px 24px 48px;
  outline: 0;
}

/* ---------- CELULAR E TABLET: menu vira gaveta ---------- */
.fundo-menu {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(6, 30, 16, 0.5);
}
@media (max-width: 1000px) {
  .lateral {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: none;
  }
  .lateral.aberta {
    transform: none;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.35);
  }
  .fechar-menu,
  .botao-menu {
    display: grid;
  }
  .principal {
    margin-left: 0;
  }
  .topo {
    padding: 0 16px;
  }
  .conteudo {
    padding: 16px 16px 40px;
  }
}
@media (max-width: 760px) {
  .busca {
    display: none;
  }
}
@media (max-width: 520px) {
  .chip-mc {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lateral {
    transition: none;
  }
}
</style>
