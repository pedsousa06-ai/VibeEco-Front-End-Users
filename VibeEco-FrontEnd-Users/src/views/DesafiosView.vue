<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DesafioIcone from '@/components/DesafioIcone.vue'
import ConfirmarAbandono from '@/components/ConfirmarAbandono.vue'
import {
  DIFICULDADES,
  ESCOPOS,
  abandonar,
  listarDesafios,
  mensagemDeErro,
  participar,
  rotuloPrazo,
} from '@/services/desafios'

const router = useRouter()

// ---------- DADOS (vêm da API) ----------
const desafios = ref([])
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    desafios.value = await listarDesafios()
  } catch (e) {
    erro.value = 'Não foi possível carregar os desafios. Tente novamente.'
    if (import.meta.env.DEV) console.error(e)
  } finally {
    carregando.value = false
  }
}
onMounted(carregar)

// Reconsulta sem trocar a tela por "carregando" (usado quando a API recusa uma ação por o
// estado ter mudado, ex.: o prazo acabou enquanto a página estava aberta)
async function atualizarEmSilencio() {
  try {
    desafios.value = await listarDesafios()
  } catch {
    /* mantém a lista como está */
  }
}

// ---------- ABAS ----------
const abas = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'individual', rotulo: 'Individuais' },
  { id: 'coletivo', rotulo: 'Coletivos' },
]
const aba = ref('todos')

function daAba(id) {
  return id === 'todos' ? desafios.value : desafios.value.filter((d) => d.escopo === id)
}
const visiveis = computed(() => daAba(aba.value))
const participando = computed(() => desafios.value.filter((d) => d.participando).length)

// ---------- AÇÕES ----------
const erroAcao = ref('')
const enviando = ref(false) // trava cliques repetidos enquanto uma ação está a caminho
const entrandoId = ref(null) // qual card mostra "Entrando..."

function falhou(e, mensagemPadrao) {
  erroAcao.value = mensagemDeErro(e, mensagemPadrao)
  if (e?.status === 409) atualizarEmSilencio()
  if (import.meta.env.DEV) console.error(e)
}

// --- CONTROLE DO MODAL DE ABANDONO ---
const modalAbandonoAberto = ref(false)
const desafioAlvo = ref(null)

function tentarSair(desafio) {
  erroAcao.value = ''
  desafioAlvo.value = desafio
  modalAbandonoAberto.value = true
}

async function confirmarAbandono() {
  const alvo = desafioAlvo.value
  if (!alvo || enviando.value) return
  enviando.value = true
  try {
    await abandonar(alvo)
  } catch (e) {
    falhou(e, 'Não foi possível abandonar o desafio. Tente novamente.')
  } finally {
    enviando.value = false
    modalAbandonoAberto.value = false
    desafioAlvo.value = null
  }
}

async function entrar(desafio) {
  if (enviando.value) return
  enviando.value = true
  entrandoId.value = desafio.id
  erroAcao.value = ''
  try {
    await participar(desafio)
    // REDIRECIONAR PARA A TELA DE INÍCIO AQUI:
    router.push('/inicio')
  } catch (e) {
    falhou(e, 'Não foi possível entrar no desafio. Tente novamente.')
  } finally {
    enviando.value = false
    entrandoId.value = null
  }
}

// Sem meta cadastrada (ou meta 0) não há como calcular a porcentagem
function pct(valor, total) {
  if (!total) return 0
  return Math.min(100, Math.round((valor / total) * 100))
}
</script>

<template>
  <div class="pagina">
    <!-- CARREGANDO -->
    <div v-if="carregando" class="vazio entrada" role="status">
      <strong>Carregando desafios...</strong>
    </div>

    <!-- ERRO AO CARREGAR -->
    <div v-else-if="erro" class="vazio entrada" role="alert">
      <strong>{{ erro }}</strong>
      <button type="button" class="botao botao-inline" @click="carregar">Tentar novamente</button>
    </div>

    <template v-else>
      <!-- ERRO DE UMA AÇÃO (participar, abandonar) -->
      <p v-if="erroAcao" class="aviso-erro entrada" role="alert">{{ erroAcao }}</p>

      <!-- ABAS + RESUMO -->
      <div class="barra entrada">
        <div class="abas" role="tablist" aria-label="Filtrar desafios">
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
            <span class="aba-contador">{{ daAba(item.id).length }}</span>
          </button>
        </div>

        <p class="resumo">
          <strong>{{ participando }}</strong>
          {{ participando === 1 ? 'desafio em andamento' : 'desafios em andamento' }}
        </p>
      </div>

      <!-- GRADE (o :key refaz a animação ao trocar de aba) -->
      <div :key="aba" class="grade">
        <article
          v-for="(d, i) in visiveis"
          :key="d.id"
          class="card entrada"
          :class="{ 'card-ativo': d.participando }"
          :style="{ '--i': i, '--cor': d.cor }"
        >
          <span class="faixa" aria-hidden="true"></span>

          <div class="tags">
            <span v-for="categoria in d.categorias" :key="categoria" class="tag tag-categoria">{{ categoria }}</span>
            <span class="tag tag-escopo">{{ ESCOPOS[d.escopo] }}</span>
            <span
              class="tag"
              :style="{ background: DIFICULDADES[d.dificuldade].fundo, color: DIFICULDADES[d.dificuldade].texto }"
            >
              {{ DIFICULDADES[d.dificuldade].rotulo }}
            </span>
            <span v-if="d.participando" class="tag tag-participando">Participando</span>
            <span v-else-if="d.concluido" class="tag tag-participando">Concluído</span>
          </div>

          <h3 class="titulo">
            <!-- o ::after deste link cobre o card inteiro, então o card todo é clicável -->
            <RouterLink :to="{ name: 'desafio-detalhe', params: { id: d.id } }" class="card-link">
              {{ d.titulo }}
            </RouterLink>
          </h3>
          <p class="descricao">{{ d.descricao }}</p>

          <div class="medidor">
            <div class="medidor-topo">
              <span>Participação</span>
              <span v-if="d.meta">{{ d.participantes }}/{{ d.meta }}</span>
              <span v-else>{{ d.participantes }} {{ d.participantes === 1 ? 'participante' : 'participantes' }}</span>
            </div>
            <div v-if="d.meta" class="trilho">
              <div class="preenchido" :style="{ width: pct(d.participantes, d.meta) + '%' }"></div>
            </div>
          </div>

          <div v-if="d.participando || d.concluido" class="medidor">
            <div class="medidor-topo">
              <span>Seu progresso</span>
              <span>{{ d.progresso }}%</span>
            </div>
            <div class="trilho">
              <div class="preenchido preenchido-meu" :style="{ width: d.progresso + '%' }"></div>
            </div>
          </div>

          <div class="recompensas">
            <span class="mc"><DesafioIcone nome="moeda" :tamanho="16" /> {{ d.mc }}</span>
            <span class="tempo"><DesafioIcone nome="relogio" :tamanho="14" /> {{ rotuloPrazo(d) }}</span>
          </div>

          <button v-if="d.participando" type="button" class="botao botao-suave" :disabled="enviando" @click="tentarSair(d)">
            Abandonar desafio
          </button>
          <button v-else-if="d.concluido" type="button" class="botao botao-suave" disabled>Desafio concluído</button>
          <button v-else-if="d.encerrado" type="button" class="botao botao-suave" disabled>Desafio encerrado</button>
          <button v-else type="button" class="botao" :disabled="enviando" @click="entrar(d)">
            {{ entrandoId === d.id ? 'Entrando...' : 'Participar do desafio' }}
          </button>
        </article>

        <div v-if="!visiveis.length" class="vazio entrada">
          <strong>Nenhum desafio nesta categoria</strong>
          <p>Novos desafios aparecem aqui assim que forem publicados.</p>
        </div>
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
.pagina {
  display: grid;
  gap: 20px;
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
  background: #d3e6d9;
  color: #0f5a2c;
  font-size: 11px;
  font-weight: 700;
  transition: background 0.2s, color 0.2s;
}
.aba-ativa .aba-contador {
  background: #16a34a;
  color: #fff;
}
.resumo {
  margin: 0;
  color: var(--texto-suave);
  font-size: 14px;
}
.resumo strong {
  color: #0f5a2c;
  font-size: 15px;
}

/* ---------- GRADE ---------- */
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  align-items: stretch;
}

/* ---------- CARD ---------- */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 20px 20px;
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--cor) 45%, #fff);
  box-shadow: 0 14px 30px -16px rgba(18, 38, 26, 0.3);
}
.card:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.card-ativo {
  border-color: color-mix(in srgb, var(--cor) 55%, #fff);
}

/* faixa de cor da categoria: cresce da esquerda no hover */
.faixa {
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: var(--cor);
  transition: height 0.25s;
}
.card:hover .faixa {
  height: 9px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
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
.tag-participando {
  margin-left: auto;
  background: #dcf8e6;
  color: #15803d;
}

.titulo {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}
.card-link {
  color: inherit;
  text-decoration: none;
}
.card-link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
.card-link:focus-visible {
  outline: none;
}
.descricao {
  margin: 0;
  color: #4b5d52;
  font-size: 14px;
  line-height: 1.5;
}

/* ---------- MEDIDORES ---------- */
.medidor {
  display: grid;
  gap: 6px;
}
.medidor-topo {
  display: flex;
  justify-content: space-between;
  color: var(--texto-suave);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
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
  animation: crescer 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: calc(var(--i, 0) * 60ms + 250ms);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.preenchido-meu {
  background: linear-gradient(90deg, #0f6b34, #1fa856);
}

/* ---------- RECOMPENSAS ---------- */
.recompensas {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: auto;
  padding-top: 2px;
  font-size: 14px;
  font-weight: 700;
}
.recompensas span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.xp {
  color: #92400e;
}
.xp svg {
  color: #f59e0b;
}
.mc {
  color: #15803d;
}
.mc svg {
  color: #64748b;
}
.tempo {
  margin-left: auto;
  color: var(--texto-suave);
  font-size: 12px;
  font-weight: 500;
}

/* ---------- BOTÕES ---------- */
.botao {
  position: relative;
  z-index: 2; /* fica acima do link que cobre o card */
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
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s, background 0.2s;
}
.botao:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.botao:active {
  transform: scale(0.98);
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
  grid-column: 1 / -1;
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

@media (max-width: 700px) {
  .grade {
    grid-template-columns: 1fr;
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
.botao-inline {
  padding: 10px 18px;
}
</style>