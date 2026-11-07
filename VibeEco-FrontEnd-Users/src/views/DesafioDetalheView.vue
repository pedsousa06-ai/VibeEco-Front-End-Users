<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DesafioIcone from '@/components/DesafioIcone.vue'
import {
  CATEGORIAS,
  DIFICULDADES,
  ESCOPOS,
  abandonar,
  alternarTarefa,
  buscarDesafio,
  concluido,
  participar,
  progressoDe,
  rotuloDias,
  tarefasFeitas,
} from '@/services/desafios'

const route = useRoute()
const desafio = computed(() => buscarDesafio(route.params.id))

const progresso = computed(() => (desafio.value ? progressoDe(desafio.value) : 0))
const feitas = computed(() => (desafio.value ? tarefasFeitas(desafio.value) : 0))
const terminou = computed(() => (desafio.value ? concluido(desafio.value) : false))

// anel de progresso (círculo de raio 52)
const CIRCUNFERENCIA = 2 * Math.PI * 52
const deslocamento = computed(() => CIRCUNFERENCIA * (1 - progresso.value / 100))

const participacao = computed(() =>
  desafio.value ? Math.min(100, Math.round((desafio.value.participantes / desafio.value.meta) * 100)) : 0,
)
</script>

<template>
  <div class="pagina">
    <RouterLink :to="{ name: 'desafios' }" class="voltar entrada">
      <DesafioIcone nome="voltar" :tamanho="16" />
      Voltar para desafios
    </RouterLink>

    <!-- NÃO ENCONTRADO -->
    <div v-if="!desafio" class="vazio entrada">
      <strong>Desafio não encontrado</strong>
      <p>Ele pode ter sido removido. Volte à lista para ver os desafios disponíveis.</p>
      <RouterLink :to="{ name: 'desafios' }" class="botao">Ver desafios</RouterLink>
    </div>

    <template v-else>
      <!-- CABEÇALHO -->
      <header
        class="hero entrada"
        :style="{ '--cor': CATEGORIAS[desafio.categoria].cor, '--i': 1 }"
      >
        <span class="faixa" aria-hidden="true"></span>

        <div class="hero-info">
          <div class="tags">
            <span class="tag tag-categoria">{{ CATEGORIAS[desafio.categoria].rotulo }}</span>
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
            <span class="xp"><DesafioIcone nome="estrela" :tamanho="15" /> {{ desafio.xp }} XP</span>
            <span class="mc"><DesafioIcone nome="moeda" :tamanho="17" /> {{ desafio.mc }} MC</span>
            <span><DesafioIcone nome="relogio" :tamanho="15" /> {{ rotuloDias(desafio.dias) }} restantes</span>
            <span>
              <DesafioIcone :nome="desafio.escopo === 'coletivo' ? 'usuarios' : 'usuario'" :tamanho="15" />
              {{ desafio.participantes }} de {{ desafio.meta }} participantes
            </span>
          </div>

          <div class="trilho" role="progressbar" :aria-valuenow="participacao" aria-valuemin="0" aria-valuemax="100" aria-label="Participação">
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
            <span>{{ feitas }}/{{ desafio.tarefas.length }} tarefas</span>
          </div>
        </div>
      </header>

      <!-- TAREFAS -->
      <section class="tarefas entrada" :style="{ '--i': 2 }" aria-labelledby="titulo-tarefas">
        <div class="tarefas-topo">
          <h3 id="titulo-tarefas">Tarefas</h3>
          <span v-if="desafio.participando" class="contagem">{{ feitas }} de {{ desafio.tarefas.length }} concluídas</span>
        </div>

        <Transition name="aviso">
          <p v-if="!desafio.participando" class="aviso">
            Participe do desafio para começar a marcar as tarefas.
          </p>
        </Transition>

        <Transition name="aviso">
          <div v-if="terminou" class="parabens" role="status">
            <strong>Desafio concluído!</strong>
            <span>Você ganhou {{ desafio.xp }} XP e {{ desafio.mc }} MC.</span>
          </div>
        </Transition>

        <ol class="lista">
          <li v-for="(t, i) in desafio.tarefas" :key="t.id" class="item entrada" :style="{ '--i': i + 3 }">
            <button
              type="button"
              class="tarefa"
              :class="{ 'tarefa-feita': t.feita }"
              :disabled="!desafio.participando"
              role="checkbox"
              :aria-checked="t.feita"
              @click="alternarTarefa(desafio, t)"
            >
              <span class="caixa"><DesafioIcone nome="check" :tamanho="16" /></span>
              <span class="tarefa-texto">
                <strong>{{ t.titulo }}</strong>
                <span>{{ t.descricao }}</span>
              </span>
            </button>
          </li>
        </ol>
      </section>

      <!-- AÇÃO -->
      <div class="acao entrada" :style="{ '--i': 4 }">
        <button v-if="desafio.participando" type="button" class="botao botao-suave" @click="abandonar(desafio)">
          Abandonar desafio
        </button>
        <button v-else type="button" class="botao" @click="participar(desafio)">Participar do desafio</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
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
  font-size: 17px;
  font-weight: 800;
}
.contagem {
  color: var(--texto-suave);
  font-size: 13px;
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
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  background: #fffbeb;
  color: #92400e;
  font-size: 14px;
}
.parabens strong {
  font-size: 16px;
}

.lista {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tarefa {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--borda);
  border-radius: 14px;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, background 0.3s, box-shadow 0.15s;
}
.tarefa:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #bfe0c8;
  box-shadow: 0 8px 20px -12px rgba(18, 38, 26, 0.3);
}
.tarefa:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.tarefa:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.tarefa-feita {
  border-color: #22c55e;
  background: #dcf8e6;
}
.caixa {
  display: grid;
  place-items: center;
  flex: none;
  width: 26px;
  height: 26px;
  margin-top: 1px;
  border: 2px solid #b6cabd;
  border-radius: 8px;
  background: #fff;
  color: #fff;
  transition: background 0.2s, border-color 0.2s, transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.tarefa-feita .caixa {
  border-color: #16a34a;
  background: #16a34a;
  transform: scale(1.08);
}
/* o "visto" se desenha ao marcar */
.caixa :deep(.traco-check) {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset 0.3s ease 0.05s;
}
.tarefa-feita .caixa :deep(.traco-check) {
  stroke-dashoffset: 0;
}
.tarefa-texto {
  display: grid;
  gap: 3px;
}
.tarefa-texto strong {
  font-size: 15px;
  font-weight: 700;
  transition: color 0.2s;
}
.tarefa-feita .tarefa-texto strong {
  color: #0f5a2c;
  text-decoration: line-through;
  text-decoration-color: #86c99e;
}
.tarefa-texto span {
  color: #4b5d52;
  font-size: 14px;
  line-height: 1.4;
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
</style>
