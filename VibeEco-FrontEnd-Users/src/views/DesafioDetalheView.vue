<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DesafioIcone from '@/components/DesafioIcone.vue'
import ConfirmarAbandono from '@/components/ConfirmarAbandono.vue' // Import do Modal
import {
  DIFICULDADES,
  ESCOPOS,
  abandonar,
  carregarDesafio,
  concluirDesafio as concluirNaApi,
  mensagemDeErro,
  participar,
  rotuloPrazo,
} from '@/services/desafios'

const route = useRoute()

// ---------- DADOS (vêm da API) ----------
const desafio = ref(null)
const carregando = ref(true)
const erro = ref('')
const requisicao = ref(0) // descarta resposta atrasada se o usuário trocar de desafio rápido

async function carregar() {
  const minha = ++requisicao.value
  carregando.value = true
  erro.value = ''
  try {
    const resultado = await carregarDesafio(route.params.id)
    if (minha === requisicao.value) desafio.value = resultado
  } catch (e) {
    if (minha === requisicao.value) {
      desafio.value = null
      erro.value = 'Não foi possível carregar o desafio. Tente novamente.'
    }
    if (import.meta.env.DEV) console.error(e)
  } finally {
    if (minha === requisicao.value) carregando.value = false
  }
}
onMounted(carregar)
watch(() => route.params.id, carregar)

const progresso = computed(() => desafio.value?.progresso ?? 0)
const terminou = computed(() => Boolean(desafio.value?.concluido))
const moedasGanhas = ref(0)

// anel de progresso (círculo de raio 52)
const CIRCUNFERENCIA = 2 * Math.PI * 52
const deslocamento = computed(() => CIRCUNFERENCIA * (1 - progresso.value / 100))

// Sem meta cadastrada não há porcentagem de participação
const participacao = computed(() => {
  const d = desafio.value
  if (!d || !d.meta) return 0
  return Math.min(100, Math.round((d.participantes / d.meta) * 100))
})

// ---------- AÇÕES ----------
const erroAcao = ref('')
const enviando = ref(false) // trava cliques repetidos

async function executar(acao, mensagemPadrao) {
  if (enviando.value || !desafio.value) return false
  enviando.value = true
  erroAcao.value = ''
  try {
    await acao()
    return true
  } catch (e) {
    erroAcao.value = mensagemDeErro(e, mensagemPadrao)
    if (e?.status === 409) carregar() // a situação mudou no servidor (ex.: prazo acabou)
    if (import.meta.env.DEV) console.error(e)
    return false
  } finally {
    enviando.value = false
  }
}

// --- CONTROLE DO MODAL DE ABANDONO ---
const modalAbandonoAberto = ref(false)

function tentarAbandonar() {
  modalAbandonoAberto.value = true
}

async function confirmarAbandono() {
  await executar(() => abandonar(desafio.value), 'Não foi possível abandonar o desafio. Tente novamente.')
  modalAbandonoAberto.value = false
}

function entrar() {
  executar(() => participar(desafio.value), 'Não foi possível entrar no desafio. Tente novamente.')
}

// --- AÇÃO DE CONCLUIR DESAFIO ---
function concluirDesafio() {
  executar(async () => {
    moedasGanhas.value = await concluirNaApi(desafio.value)
  }, 'Não foi possível concluir o desafio. Tente novamente.')
}
</script>

<template>
  <div class="pagina">
    <RouterLink :to="{ name: 'desafios' }" class="voltar entrada">
      <DesafioIcone nome="voltar" :tamanho="16" />
      Voltar para desafios
    </RouterLink>

    <!-- CARREGANDO -->
    <div v-if="carregando" class="vazio entrada" role="status">
      <strong>Carregando desafio...</strong>
    </div>

    <!-- ERRO AO CARREGAR -->
    <div v-else-if="erro" class="vazio entrada" role="alert">
      <strong>{{ erro }}</strong>
      <button type="button" class="botao" @click="carregar">Tentar novamente</button>
    </div>

    <!-- NÃO ENCONTRADO -->
    <div v-else-if="!desafio" class="vazio entrada">
      <strong>Desafio não encontrado</strong>
      <p>Ele pode ter sido removido. Volte à lista para ver os desafios disponíveis.</p>
      <RouterLink :to="{ name: 'desafios' }" class="botao">Ver desafios</RouterLink>
    </div>

    <template v-else>
      <p v-if="erroAcao" class="aviso-erro entrada" role="alert">{{ erroAcao }}</p>

      <!-- CABEÇALHO -->
      <header class="hero entrada" :style="{ '--cor': desafio.cor, '--i': 1 }">
        <span class="faixa" aria-hidden="true"></span>

        <div class="hero-info">
          <div class="tags">
            <span v-for="categoria in desafio.categorias" :key="categoria" class="tag tag-categoria">{{ categoria }}</span>
            <span class="tag tag-escopo">{{ ESCOPOS[desafio.escopo] }}</span>
            <span
              class="tag"
              :style="{
                background: DIFICULDADES[desafio.dificuldade].fundo,
                color: DIFICULDADES[desafio.dificuldade].texto,
              }"
            >
              {{ DIFICULDADES[desafio.dificuldade].rotulo }}
            </span>
          </div>

          <h2>{{ desafio.titulo }}</h2>
          <p class="descricao">{{ desafio.descricao }}</p>

          <div class="fatos">
            <span class="mc"><DesafioIcone nome="moeda" :tamanho="17" /> {{ desafio.mc }} MC</span>
            <span><DesafioIcone nome="relogio" :tamanho="15" /> {{ rotuloPrazo(desafio, true) }}</span>
            <span>
              <DesafioIcone :nome="desafio.escopo === 'coletivo' ? 'usuarios' : 'usuario'" :tamanho="15" />
              <template v-if="desafio.meta">{{ desafio.participantes }} de {{ desafio.meta }} participantes</template>
              <template v-else>{{ desafio.participantes }} {{ desafio.participantes === 1 ? 'participante' : 'participantes' }}</template>
            </span>
          </div>

          <div
            v-if="desafio.meta"
            class="trilho"
            role="progressbar"
            :aria-valuenow="participacao"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Participação"
          >
            <div class="preenchido" :style="{ width: participacao + '%' }"></div>
          </div>
        </div>

        <!-- ANEL DE PROGRESSO -->
        <div class="anel" :class="{ 'anel-completo': terminou }">
          <svg viewBox="0 0 120 120" width="132" height="132" role="img" :aria-label="`Seu progresso: ${progresso}%`">
            <circle class="anel-fundo" cx="60" cy="60" r="52" />
            <circle
              class="anel-valor"
              cx="60"
              cy="60"
              r="52"
              :stroke-dasharray="CIRCUNFERENCIA"
              :stroke-dashoffset="deslocamento"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="anel-texto">
            <strong>{{ progresso }}%</strong>
            <span>{{ terminou ? 'Concluído' : desafio.participando ? 'Em andamento' : 'Pendente' }}</span>
          </div>
        </div>
      </header>

      <!-- CONCLUSÃO -->
      <section class="tarefas entrada" :style="{ '--i': 2 }" aria-labelledby="titulo-tarefas">
        <div class="tarefas-topo" style="justify-content: center; text-align: center; margin-bottom: 8px;">
          <h3 id="titulo-tarefas">Você cumpriu este desafio?</h3>
        </div>

        <Transition name="aviso">
          <p v-if="!desafio.participando && !terminou" class="aviso" style="text-align: center;">
            {{
              desafio.encerrado
                ? 'O prazo deste desafio já acabou.'
                : 'Participe do desafio para poder marcá-lo como concluído.'
            }}
          </p>
        </Transition>

        <Transition name="aviso">
          <div v-if="terminou" class="parabens" role="status" style="text-align: center; justify-items: center;">
            <DesafioIcone nome="check" :tamanho="36" style="color: #16a34a; margin-bottom: 8px;" />
            <strong>Desafio concluído!</strong>
            <span v-if="moedasGanhas">Você ganhou {{ moedasGanhas }} MC.</span>
            <span v-else>Você já recebeu as {{ desafio.mc }} MC deste desafio.</span>
          </div>
        </Transition>

        <!-- BOTÃO DE CONCLUIR DIRETO -->
        <div v-if="desafio.participando && !terminou" class="acao" style="margin-top: 8px;">
          <button type="button" class="botao" :disabled="enviando" @click="concluirDesafio">
            {{ enviando ? 'Salvando...' : 'Sim, cumpri o desafio' }}
          </button>
        </div>
      </section>

      <!-- AÇÃO SECUNDÁRIA (Abandonar / Participar) -->
      <div v-if="!terminou" class="acao entrada" :style="{ '--i': 4 }">
        <button v-if="desafio.participando" type="button" class="botao botao-suave" :disabled="enviando" @click="tentarAbandonar">
          Abandonar desafio
        </button>
        <button v-else-if="desafio.encerrado" type="button" class="botao botao-suave" disabled>Desafio encerrado</button>
        <button v-else type="button" class="botao" :disabled="enviando" @click="entrar">
          {{ enviando ? 'Entrando...' : 'Participar do desafio' }}
        </button>
      </div>
    </template>

    <!-- MODAL DE CONFIRMAÇÃO -->
    <ConfirmarAbandono
      v-if="modalAbandonoAberto"
      @confirmar="confirmarAbandono"
      @cancelar="modalAbandonoAberto = false"
    />
  </div>
</template>

<style scoped>
/* O CSS continua exatamente o mesmo, pois as classes de layout se mantêm */
.pagina {
  display: grid;
  gap: 20px;
  max-width: 840px;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 6px 4px;
  color: var(--texto-suave);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s;
}
.voltar svg {
  transition: transform 0.2s;
}
.voltar:hover {
  color: #0f5a2c;
}
.voltar:hover svg {
  transform: translateX(-3px);
}
.voltar:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
  border-radius: 6px;
}

/* ---------- CABEÇALHO ---------- */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 28px 28px 26px;
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.faixa {
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: var(--cor);
}
.hero-info {
  display: grid;
  flex: 1;
  gap: 14px;
  min-width: 0;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}
.tag-categoria {
  background: color-mix(in srgb, var(--cor) 14%, #fff);
  color: color-mix(in srgb, var(--cor) 70%, #000);
}
.tag-escopo {
  background: #eef2ef;
  color: #52665a;
}
.hero h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}
.descricao {
  margin: 0;
  max-width: 60ch;
  color: #4b5d52;
  font-size: 15px;
  line-height: 1.55;
}
.fatos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  color: var(--texto-suave);
  font-size: 13px;
}
.fatos span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.fatos .xp {
  color: #92400e;
  font-weight: 700;
}
.fatos .xp svg {
  color: #f59e0b;
}
.fatos .mc {
  color: #15803d;
  font-weight: 700;
}
.fatos .mc svg {
  color: #64748b;
}
.trilho {
  height: 7px;
  overflow: hidden;
  border-radius: 99px;
  background: #e3ece6;
}
.preenchido {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  transform-origin: left;
  animation: crescer 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s backwards;
}

/* ---------- ANEL ---------- */
.anel {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
}
.anel-fundo {
  fill: none;
  stroke: #e3ece6;
  stroke-width: 10;
}
.anel-valor {
  fill: none;
  stroke: #16a34a;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.3s;
}
.anel-completo .anel-valor {
  stroke: #f59e0b;
}
.anel-completo {
  animation: pulso 0.6s ease-out;
}
.anel-texto {
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 2px;
}
.anel-texto strong {
  font-size: 26px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.anel-texto span {
  color: var(--texto-suave);
  font-size: 12px;
}

/* ---------- TAREFAS ---------- */
.tarefas {
  display: grid;
  gap: 14px;
  padding: 22px 24px;
  border: 1px solid var(--borda);
  border-radius: 18px;
  background: #fff;
}
.tarefas-topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.tarefas h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}
.aviso {
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff7e6;
  color: #92400e;
  font-size: 14px;
}
.parabens {
  display: grid;
  gap: 4px;
  padding: 20px 16px;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  background: #fffbeb;
  color: #92400e;
  font-size: 14px;
}
.parabens strong {
  font-size: 18px;
}

/* ---------- BOTÕES ---------- */
.acao {
  display: grid;
}
.botao {
  display: grid;
  place-items: center;
  padding: 14px 16px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #0f6b34, #1fa856);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s, background 0.2s;
}
.botao:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.botao:active {
  transform: scale(0.99);
}
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.botao-suave {
  background: #eef2ef;
  color: #52665a;
}
.botao-suave:hover {
  filter: none;
  background: #fde8e8;
  color: #b91c1c;
}

.vazio {
  display: grid;
  justify-items: center;
  gap: 8px;
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
  margin: 0 0 8px;
  font-size: 14px;
}
.vazio .botao {
  padding: 12px 20px;
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
@keyframes crescer {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes pulso {
  40% { transform: scale(1.08); }
}
.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 700px) {
  .hero {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  .anel {
    align-self: center;
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

/* ---------- ESTADOS: ERRO E BOTÃO DESABILITADO ---------- */
.aviso-erro {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid #f3c4c4;
  border-radius: 10px;
  background: #fde8e8;
  color: #b91c1c;
  font-size: 14px;
}
.botao:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  transform: none;
  filter: none;
}
</style>