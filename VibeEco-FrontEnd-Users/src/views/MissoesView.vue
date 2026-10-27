<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icone from '@/components/Icone.vue'
import { missoesLista, participar, progressoDe, rotuloPrazo, statusDe, xpTotal } from '@/services/missoes'

const router = useRouter()

const abas = [
  { id: 'todas', nome: 'Todas' },
  { id: 'disponivel', nome: 'Disponíveis' },
  { id: 'andamento', nome: 'Em Andamento' },
  { id: 'concluida', nome: 'Concluídas' },
]
const abaAtual = ref('todas')

const cartoes = computed(() =>
  missoesLista.map((m) => ({ m, status: statusDe(m), progresso: progressoDe(m), xp: xpTotal(m) }))
)
const contagem = computed(() => ({
  todas: cartoes.value.length,
  disponivel: cartoes.value.filter((c) => c.status === 'disponivel').length,
  andamento: cartoes.value.filter((c) => c.status === 'andamento').length,
  concluida: cartoes.value.filter((c) => c.status === 'concluida').length,
}))
const visiveis = computed(() =>
  abaAtual.value === 'todas' ? cartoes.value : cartoes.value.filter((c) => c.status === abaAtual.value)
)

const ROTULO_ACAO = { andamento: 'Continuar', disponivel: 'Participar', concluida: 'Ver detalhes' }

function acao(cartao) {
  if (cartao.status === 'disponivel') participar(cartao.m) // TODO: confirmar a participação na API
  router.push(`/missoes/${cartao.m.id}`)
}

// Setas esquerda/direita trocam de aba (padrão de abas acessíveis)
function aoApertarTecla(e) {
  const i = abas.findIndex((a) => a.id === abaAtual.value)
  const proxima = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null
  if (proxima === null) return
  e.preventDefault()
  const alvo = abas[(proxima + abas.length) % abas.length]
  abaAtual.value = alvo.id
  document.getElementById(`aba-${alvo.id}`)?.focus()
}

const classeDificuldade = (d) => d.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
</script>

<template>
  <div class="missoes">
    <header class="cabecalho">
      <h2>Missões</h2>
      <p>Complete missões para ganhar XP, Moedas Verdes e desbloquear conquistas.</p>
    </header>

    <div class="abas">
      <div class="abas-lista" role="tablist" aria-label="Filtrar missões" @keydown="aoApertarTecla">
        <button
          v-for="aba in abas"
          :id="`aba-${aba.id}`"
          :key="aba.id"
          type="button"
          role="tab"
          class="aba"
          :class="{ 'aba-ativa': abaAtual === aba.id }"
          :aria-selected="abaAtual === aba.id"
          :tabindex="abaAtual === aba.id ? 0 : -1"
          aria-controls="painel-missoes"
          @click="abaAtual = aba.id"
        >
          {{ aba.nome }}
          <span class="contagem">{{ contagem[aba.id] }}</span>
        </button>
      </div>
    </div>

    <div id="painel-missoes" role="tabpanel" :aria-labelledby="`aba-${abaAtual}`">
      <p v-if="!visiveis.length" class="vazio">Nenhuma missão nesta categoria por enquanto.</p>

      <div v-else class="grade">
        <article v-for="c in visiveis" :key="c.m.id" class="card">
          <div class="tags">
            <span class="tag">{{ c.m.categoria }}</span>
            <span class="tag" :class="'dif-' + classeDificuldade(c.m.dificuldade)">{{ c.m.dificuldade }}</span>
            <span v-if="c.status === 'concluida'" class="tag tag-concluida">Concluída</span>
          </div>

          <h3>{{ c.m.titulo }}</h3>
          <p class="resumo">{{ c.m.resumo }}</p>

          <div class="progresso-linha">
            <span>Progresso</span>
            <span>{{ c.progresso }}%</span>
          </div>
          <div
            class="barra"
            role="progressbar"
            :aria-label="`Progresso da missão ${c.m.titulo}`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="c.progresso"
          >
            <div class="barra-preenchimento" :style="{ width: c.progresso + '%' }"></div>
          </div>

          <div class="recompensas">
            <div class="recompensas-itens">
              <span class="xp"><Icone nome="estrela" :tamanho="15" preenchido />{{ c.xp }} XP</span>
              <span class="mc"><Icone nome="moeda" :tamanho="16" />{{ c.m.mc }}</span>
            </div>
            <span v-if="c.m.prazo && c.status !== 'concluida'" class="prazo">
              <Icone nome="relogio" :tamanho="13" />{{ rotuloPrazo(c.m.prazo) }}
            </span>
          </div>

          <button type="button" class="botao" :class="'botao-' + c.status" @click="acao(c)">
            {{ ROTULO_ACAO[c.status] }}
            <Icone nome="seta" :tamanho="15" />
            <span class="so-leitor">: {{ c.m.titulo }}</span>
          </button>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cabecalho h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.cabecalho p {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--texto-suave);
}

/* ---------- ABAS ---------- */
.abas {
  display: flex;
  justify-content: center;
  margin: 28px 0 24px;
  overflow-x: auto;
}
.abas-lista {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #e6eee8;
}
.aba {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--texto-suave);
  font: inherit;
  font-size: 14.5px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}
.aba:hover {
  color: var(--texto);
}
.aba:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.aba-ativa {
  background: #fff;
  color: var(--texto);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(18, 38, 26, 0.12);
}
.contagem {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 99px;
  background: rgba(18, 38, 26, 0.07);
  font-size: 12px;
  font-weight: 600;
}
.aba-ativa .contagem {
  background: var(--verde-100);
  color: #0f6b34;
}

/* ---------- CARDS ---------- */
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.tags {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tag {
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--verde-100);
  color: #0f6b34;
  font-size: 12px;
  font-weight: 600;
}
.dif-facil {
  background: var(--verde-100);
  color: #0f6b34;
}
.dif-medio {
  background: #fff1dc;
  color: #c26a00;
}
.dif-dificil {
  background: #fee2e2;
  color: #c62828;
}
.tag-concluida {
  margin-left: auto;
  background: #dcf5e5;
  color: #15803d;
}

.card h3 {
  margin: 14px 0 6px;
  font-size: 19px;
  font-weight: 700;
}
.resumo {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--texto-suave);
}
.progresso-linha {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--texto-suave);
}
.barra {
  height: 7px;
  border-radius: 99px;
  background: #d6eadb;
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.recompensas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
}
.recompensas-itens {
  display: flex;
  align-items: center;
  gap: 14px;
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
.mc {
  color: #16a34a;
}
.prazo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--texto-suave);
}

.botao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 42px;
  margin-top: auto;
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, background 0.15s;
}
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.botao-andamento {
  background: #14603a;
  color: #fff;
}
.botao-andamento:hover {
  background: #104d2f;
}
.botao-disponivel {
  background: #22c55e;
  color: #fff;
}
.botao-disponivel:hover {
  background: #1eae53;
}
.botao-concluida {
  background: #eaf0eb;
  color: var(--texto-suave);
}
.botao-concluida:hover {
  background: #dfe8e1;
  color: var(--texto);
}

.vazio {
  padding: 48px 0;
  text-align: center;
  color: var(--texto-suave);
}
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .barra-preenchimento {
    transition: none;
  }
}
@media (max-width: 700px) {
  .abas {
    justify-content: flex-start;
  }
}
</style>
