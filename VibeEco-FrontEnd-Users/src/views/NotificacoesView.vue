<script setup>
import { computed, ref } from 'vue'
import Icone from '@/components/Icone.vue'
import IconeTipo from '@/components/IconeTipo.vue'
import DetalheLateral from '@/components/DetalheLateral.vue'
import { TIPOS } from '@/services/tipos'
import {
  marcarComoLida,
  marcarTodasComoLidas,
  naoLidas,
  notificacoes,
  tempoRelativo,
} from '@/services/notificacoes'

// ---------- ABAS ----------
const abas = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'missao', rotulo: 'Missões' },
  { id: 'desafio', rotulo: 'Desafios' },
  { id: 'conquista', rotulo: 'Conquistas' },
]
const aba = ref('todas')

function daAba(id) {
  return id === 'todas' ? notificacoes : notificacoes.filter((n) => n.tipo === id)
}
const visiveis = computed(() => daAba(aba.value))
function naoLidasDa(id) {
  return daAba(id).filter((n) => !n.lida).length
}

// ---------- DETALHES ----------
// `atual` fica guardado ao fechar para o conteúdo não sumir durante a animação
const aberto = ref(false)
const atual = ref(null)

function abrir(notificacao) {
  atual.value = notificacao
  aberto.value = true
  marcarComoLida(notificacao.id)
}
function fechar() {
  aberto.value = false
}
</script>

<template>
  <div class="pagina">
    <!-- ABAS + AÇÃO -->
    <div class="barra entrada">
      <div class="abas" role="tablist" aria-label="Filtrar notificações">
        <button
          v-for="item in abas"
          :key="item.id"
          type="button"
          role="tab"
          class="aba"
          :class="{ 'aba-ativa': aba === item.id }"
          :aria-selected="aba === item.id"
          @click="aba = item.id"
        >
          {{ item.rotulo }}
          <span v-if="naoLidasDa(item.id)" class="aba-contador">{{ naoLidasDa(item.id) }}</span>
        </button>
      </div>

      <button type="button" class="marcar" :disabled="!naoLidas" @click="marcarTodasComoLidas">
        <Icone nome="checkduplo" :tamanho="16" />
        Marcar todas como lidas
      </button>
    </div>

    <!-- LISTA (o :key refaz a animação de entrada ao trocar de aba) -->
    <div :key="aba" class="lista">
      <button
        v-for="(n, i) in visiveis"
        :key="n.id"
        type="button"
        class="notificacao entrada"
        :class="{ 'nao-lida': !n.lida }"
        :style="{ '--i': i }"
        @click="abrir(n)"
      >
        <IconeTipo :tipo="n.tipo" :tamanho="44" />

        <span class="notificacao-texto">
          <strong>{{ n.titulo }}</strong>
          <span>{{ n.texto }}</span>
        </span>

        <span class="notificacao-tempo">
          {{ tempoRelativo(n.minutosAtras) }}
          <span v-if="!n.lida" class="ponto" aria-hidden="true"></span>
          <span v-if="!n.lida" class="so-leitor">Não lida</span>
        </span>
      </button>

      <div v-if="!visiveis.length" class="vazio entrada">
        <Icone nome="sino" :tamanho="40" />
        <strong>Nada por aqui</strong>
        <p>Quando houver novidades nesta categoria, elas aparecem aqui.</p>
      </div>
    </div>

    <!-- PAINEL DE DETALHES -->
    <DetalheLateral
      :aberto="aberto"
      :tipo="atual?.tipo"
      :titulo="atual?.titulo"
      :quando="atual ? tempoRelativo(atual.minutosAtras) : ''"
      @fechar="fechar"
    >
      <template v-if="atual">
        <p class="det-texto">{{ atual.texto }}</p>

        <dl class="det-lista">
          <div v-for="d in atual.detalhes" :key="d.rotulo">
            <dt>{{ d.rotulo }}</dt>
            <dd>{{ d.valor }}</dd>
          </div>
        </dl>
      </template>

      <template v-if="atual" #acoes>
        <button type="button" class="botao botao-suave" @click="fechar">Fechar</button>
        <RouterLink :to="TIPOS[atual.tipo].destino.to" class="botao" @click="fechar">
          {{ TIPOS[atual.tipo].destino.rotulo }}
        </RouterLink>
      </template>
    </DetalheLateral>
  </div>
</template>

<style scoped>

.pagina {
  display: grid;
  gap: 18px;
  max-width: 840px;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}

/* ---------- BARRA ---------- */
.barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.abas {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #e8f1ea;
}
.aba {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--texto-suave);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.aba:hover {
  color: #0f5a2c;
}
.aba:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.aba-ativa {
  background: #fff;
  color: #0f5a2c;
  box-shadow: 0 1px 3px rgba(18, 38, 26, 0.12);
}
.aba-contador {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 99px;
  background: #16a34a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.marcar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #bfe3cb;
  border-radius: 10px;
  background: #e3f5ea;
  color: #0f5a2c;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.marcar:hover:not(:disabled) {
  background: #d3eedd;
  transform: translateY(-1px);
}
.marcar:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.marcar:disabled {
  border-color: var(--borda);
  background: #f1f5f2;
  color: #8aa393;
  cursor: default;
}

/* ---------- LISTA ---------- */
.lista {
  display: grid;
  gap: 10px;
}
.notificacao {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--borda);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.2s, background 0.3s;
}
.notificacao:hover {
  transform: translateY(-2px);
  border-color: #bfe0c8;
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.notificacao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.nao-lida {
  border-color: #22c55e;
  background: #dcf8e6;
}
.nao-lida:hover {
  border-color: #16a34a;
}
.notificacao-texto {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
}
.notificacao-texto strong {
  font-size: 15px;
  font-weight: 700;
}
.notificacao-texto span {
  color: #4b5d52;
  font-size: 14px;
  line-height: 1.4;
}
.notificacao-tempo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  color: var(--texto-suave);
  font-size: 12px;
  white-space: nowrap;
}
.ponto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  animation: piscar 1.8s ease-in-out infinite;
}
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.vazio {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 48px 20px;
  border: 1px dashed var(--borda);
  border-radius: 16px;
  color: var(--texto-suave);
  text-align: center;
}
.vazio strong {
  color: #0f5a2c;
  font-size: 16px;
}
.vazio p {
  margin: 0;
  font-size: 14px;
}

/* ---------- CONTEÚDO DO PAINEL (renderizado dentro do DetalheLateral) ---------- */
.det-texto {
  margin: 0;
  color: #3d4f44;
  font-size: 15px;
  line-height: 1.55;
}
.det-lista {
  display: grid;
  margin: 0;
  border: 1px solid var(--borda);
  border-radius: 14px;
  overflow: hidden;
}
.det-lista > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  font-size: 14px;
}
.det-lista > div + div {
  border-top: 1px solid var(--borda);
}
.det-lista dt {
  color: var(--texto-suave);
}
.det-lista dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.botao {
  display: grid;
  place-items: center;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #0f6b34, #1fa856);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
}
.botao:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.botao-suave {
  background: #eef6f0;
  color: #1f5d37;
}
.botao-suave:hover {
  filter: none;
  background: #e1efe5;
}

/* ---------- ANIMAÇÕES ---------- */
.entrada {
  animation: entrar 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: calc(var(--i, 0) * 60ms);
}
@keyframes entrar {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
@keyframes piscar {
  50% { opacity: 0.35; transform: scale(0.75); }
}

@media (max-width: 700px) {
  .notificacao {
    flex-wrap: wrap;
  }
  .notificacao-texto {
    flex-basis: calc(100% - 70px);
  }
  .notificacao-tempo {
    margin-left: 58px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
