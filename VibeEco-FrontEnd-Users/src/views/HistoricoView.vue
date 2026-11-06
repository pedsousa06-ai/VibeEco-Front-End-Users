<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Icone from '@/components/Icone.vue'
import IconeTipo from '@/components/IconeTipo.vue'
import DetalheLateral from '@/components/DetalheLateral.vue'
import { TIPOS } from '@/services/tipos'
import { atividades, resumoHistorico } from '@/services/historico'

const reduzMovimento =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- CONTADORES DO TOPO ----------
const numeros = ref(resumoHistorico.map(() => 0))
let cancelado = false

function contar(destino, aplicar, duracao = 1000) {
  if (reduzMovimento) return aplicar(destino)
  const inicio = performance.now()
  const passo = (agora) => {
    if (cancelado) return
    const t = Math.min((agora - inicio) / duracao, 1)
    aplicar(Math.round(destino * (1 - Math.pow(1 - t, 3))))
    if (t < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

onMounted(() => {
  resumoHistorico.forEach((item, i) =>
    contar(item.numero, (v) => (numeros.value[i] = v), 800 + i * 150)
  )
})
onBeforeUnmount(() => (cancelado = true))

// ---------- FILTRO ----------
const filtros = [
  { id: 'todos', rotulo: 'Tudo' },
  { id: 'missao', rotulo: 'Missões' },
  { id: 'conteudo', rotulo: 'Conteúdos' },
  { id: 'desafio', rotulo: 'Desafios' },
  { id: 'conquista', rotulo: 'Conquistas' },
  { id: 'recompensa', rotulo: 'Recompensas' },
]
const filtro = ref('todos')

// ---------- DATAS ----------
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

function dataDe(diasAtras) {
  const data = new Date()
  data.setHours(0, 0, 0, 0)
  data.setDate(data.getDate() - diasAtras)
  return data
}

// "HOJE, 05 NOV 2026", "ONTEM, 04 NOV 2026", "03 NOV 2026"
function rotuloDia(diasAtras) {
  const d = dataDe(diasAtras)
  const base = `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
  if (diasAtras === 0) return `HOJE, ${base}`
  if (diasAtras === 1) return `ONTEM, ${base}`
  return base
}

// "Hoje, 5 de novembro de 2026 às 14:32"
function quandoDe(atividade) {
  const data = dataDe(atividade.diasAtras).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const prefixo = atividade.diasAtras === 0 ? 'Hoje, ' : atividade.diasAtras === 1 ? 'Ontem, ' : ''
  return `${prefixo}${data} às ${atividade.hora}`
}

// ---------- GRUPOS POR DIA ----------
const grupos = computed(() => {
  const mapa = new Map()
  let ordem = 0
  for (const a of atividades) {
    if (filtro.value !== 'todos' && a.tipo !== filtro.value) continue
    if (!mapa.has(a.diasAtras)) mapa.set(a.diasAtras, [])
    mapa.get(a.diasAtras).push({ ...a, ordem: ordem++ })
  }
  return [...mapa.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([dias, itens]) => ({ dias, rotulo: rotuloDia(dias), itens }))
})

function sinal(valor) {
  return valor > 0 ? `+${valor}` : String(valor)
}

// ---------- DETALHES ----------
const aberto = ref(false)
const atual = ref(null)

function abrir(atividade) {
  atual.value = atividade
  aberto.value = true
}
function fechar() {
  aberto.value = false
}
</script>

<template>
  <div class="pagina">
    <!-- RESUMO -->
    <section class="resumo" aria-label="Resumo do histórico">
      <article
        v-for="(item, i) in resumoHistorico"
        :key="item.rotulo"
        class="card resumo-card entrada"
        :style="{ '--i': i }"
      >
        <strong :style="{ color: item.cor }">{{ numeros[i] }}</strong>
        <span>{{ item.rotulo }}</span>
      </article>
    </section>

    <!-- FILTROS -->
    <div class="filtros entrada" :style="{ '--i': 4 }" role="group" aria-label="Filtrar por tipo">
      <button
        v-for="f in filtros"
        :key="f.id"
        type="button"
        class="filtro"
        :class="{ 'filtro-ativo': filtro === f.id }"
        :aria-pressed="filtro === f.id"
        @click="filtro = f.id"
      >
        {{ f.rotulo }}
      </button>
    </div>

    <!-- LINHA DO TEMPO (o :key refaz a animação ao trocar de filtro) -->
    <div :key="filtro" class="linha-tempo">
      <section v-for="g in grupos" :key="g.dias" class="dia" :aria-label="g.rotulo">
        <h3 class="dia-titulo">{{ g.rotulo }}</h3>

        <ol class="itens">
          <li v-for="a in g.itens" :key="a.id" class="item entrada" :style="{ '--i': a.ordem }">
            <IconeTipo :tipo="a.tipo" :tamanho="40" />

            <button type="button" class="card item-card" @click="abrir(a)">
              <span class="item-texto">
                <span class="item-rotulo" :style="{ color: TIPOS[a.tipo].texto }">{{ a.rotulo }}</span>
                <strong>{{ a.titulo }}</strong>
              </span>

              <span v-if="a.xp || a.mc" class="ganhos-linha">
                <span v-if="a.xp" class="xp"><Icone nome="estrela" :tamanho="13" preenchido />+{{ a.xp }} XP</span>
                <span v-if="a.mc" class="mc" :class="a.mc < 0 ? 'mc-neg' : 'mc-pos'">
                  <Icone nome="moeda" :tamanho="15" />{{ sinal(a.mc) }}
                </span>
              </span>
            </button>
          </li>
        </ol>
      </section>

      <div v-if="!grupos.length" class="vazio entrada">
        <Icone nome="historico" :tamanho="40" />
        <strong>Nenhuma atividade encontrada</strong>
        <p>Tente outro filtro para ver mais do seu histórico.</p>
      </div>
    </div>

    <!-- PAINEL DE DETALHES -->
    <DetalheLateral
      :aberto="aberto"
      :tipo="atual?.tipo"
      :rotulo="atual?.rotulo"
      :titulo="atual?.titulo"
      :quando="atual ? quandoDe(atual) : ''"
      @fechar="fechar"
    >
      <template v-if="atual">
        <div v-if="atual.xp || atual.mc" class="ganhos">
          <div v-if="atual.xp" class="ganho ganho-xp">
            <Icone nome="estrela" :tamanho="20" preenchido />
            <strong>+{{ atual.xp }}</strong>
            <small>XP</small>
          </div>
          <div v-if="atual.mc" class="ganho" :class="atual.mc < 0 ? 'ganho-neg' : 'ganho-mc'">
            <Icone nome="moeda" :tamanho="20" />
            <strong>{{ sinal(atual.mc) }}</strong>
            <small>Moedas Verdes</small>
          </div>
        </div>

        <div v-if="atual.progresso !== undefined" class="progresso">
          <div class="progresso-topo">
            <small>Progresso</small>
            <small>{{ atual.progresso }}%</small>
          </div>
          <div
            class="barra"
            role="progressbar"
            aria-label="Progresso"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="atual.progresso"
          >
            <div class="barra-preenchimento" :style="{ width: atual.progresso + '%' }"></div>
          </div>
        </div>

        <p class="det-texto">{{ atual.descricao }}</p>

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
  gap: 20px;
  max-width: 840px;
}
.card {
  border: 1px solid var(--borda);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}

/* ---------- RESUMO ---------- */
.resumo {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.resumo-card {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 4px;
  padding: 20px 12px;
  text-align: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.resumo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.resumo-card strong {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.resumo-card span {
  color: var(--texto-suave);
  font-size: 13px;
}

/* ---------- FILTROS ---------- */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filtro {
  padding: 7px 14px;
  border: 1px solid var(--borda);
  border-radius: 99px;
  background: #fff;
  color: var(--texto-suave);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.filtro:hover {
  border-color: #9bcaa9;
  color: #0f5a2c;
}
.filtro:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.filtro-ativo {
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}
.filtro-ativo:hover {
  color: #fff;
}

/* ---------- LINHA DO TEMPO ---------- */
.linha-tempo {
  display: grid;
  gap: 22px;
}
.dia-titulo {
  margin: 0 0 10px;
  color: #4b5d52;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.itens {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
/* fio que liga um ícone ao próximo */
.item:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 44px;
  bottom: -8px;
  left: 19px;
  width: 2px;
  border-radius: 2px;
  background: #cfe6d6;
}
.item-card {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 14px 18px;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.item-card:hover {
  transform: translateX(3px);
  border-color: #bfe0c8;
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.item-card:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.item-texto {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.item-rotulo {
  font-size: 12px;
  font-weight: 600;
}
.item-texto strong {
  font-size: 15px;
  font-weight: 500;
}
.ganhos-linha {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex: none;
}
.xp,
.mc {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 700;
}
.xp {
  color: #8a5a00;
}
.xp svg {
  color: #f5b301;
}
.mc svg {
  color: #d97706;
}
.mc-pos {
  color: #16a34a;
}
.mc-neg {
  color: #dc2626;
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
.ganhos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}
.ganho {
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 14px 10px;
  border-radius: 14px;
}
.ganho strong {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
}
.ganho small {
  font-size: 12px;
}
.ganho-xp {
  background: #fef3c7;
  color: #8a5a00;
}
.ganho-xp svg {
  color: #f5b301;
}
.ganho-mc {
  background: #dcf5e5;
  color: #0f6b34;
}
.ganho-neg {
  background: #fee2e2;
  color: #b91c1c;
}

.progresso-topo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: var(--texto-suave);
}
.barra {
  height: 8px;
  border-radius: 99px;
  background: #d6eadb;
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a, #4ade80);
}

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

/* ---------- RESPONSIVO ---------- */
@media (max-width: 700px) {
  .resumo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .item-card {
    flex-wrap: wrap;
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
