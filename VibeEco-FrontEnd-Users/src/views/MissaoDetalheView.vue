<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '@/components/Icone.vue'
import EtapaModal from '@/components/EtapaModal.vue'
import {
  buscarMissao, concluirEtapa, etapaAtual, etapasConcluidas,
  participar, progressoDe, rotuloPrazo, statusDe, xpTotal,
} from '@/services/missoes'

const route = useRoute()

const missao = computed(() => buscarMissao(route.params.id))
const status = computed(() => (missao.value ? statusDe(missao.value) : ''))
const progresso = computed(() => (missao.value ? progressoDe(missao.value) : 0))
const atual = computed(() => (missao.value ? etapaAtual(missao.value) : null))

const modalAberto = ref(false)
const aviso = ref('')
let timerAviso
function avisar(texto) {
  aviso.value = texto
  clearTimeout(timerAviso)
  timerAviso = setTimeout(() => (aviso.value = ''), 6000)
}
onBeforeUnmount(() => clearTimeout(timerAviso))

function estadoDa(etapa) {
  if (etapa.concluida) return 'concluida'
  return atual.value?.id === etapa.id ? 'andamento' : 'pendente'
}
const ROTULO_ESTADO = { concluida: 'Concluída', andamento: 'Em andamento', pendente: '' }

function abrirEtapa() {
  if (atual.value) modalAberto.value = true
}

// Resposta da etapa (modal): dá XP e, se foi a última, a missão termina
function resultado({ missaoConcluida }, etapa) {
  modalAberto.value = false
  avisar(
    missaoConcluida
      ? `Missão concluída! Você ganhou +${etapa.xp} XP e +${missao.value.mc} Moedas Verdes.`
      : `Etapa concluída! Você ganhou +${etapa.xp} XP.`
  )
}
function aoConcluir() {
  const etapa = atual.value
  if (etapa) resultado(concluirEtapa(missao.value, etapa), etapa)
}
function aoParticipar() {
  participar(missao.value) // TODO: confirmar a participação na API
  avisar('Você entrou na missão! Comece pela primeira etapa.')
}

const classeDificuldade = (d) => d.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
</script>

<template>
  <div v-if="missao" class="pagina">
    <RouterLink to="/missoes" class="voltar"><Icone nome="voltar" :tamanho="16" />Voltar para Missões</RouterLink>

    <p v-if="aviso" class="aviso" role="status">{{ aviso }}</p>

    <div class="detalhe">
      <div class="principal">
        <!-- RESUMO -->
        <section class="card resumo">
          <div class="tags">
            <span class="tag">{{ missao.categoria }}</span>
            <span class="tag" :class="'dif-' + classeDificuldade(missao.dificuldade)">{{ missao.dificuldade }}</span>
          </div>
          <h2>{{ missao.titulo }}</h2>
          <p class="descricao">{{ missao.descricao }}</p>

          <div class="numeros">
            <div class="numero numero-xp">
              <Icone nome="estrela" :tamanho="20" preenchido />
              <div><small>XP</small><strong>{{ xpTotal(missao) }} XP</strong></div>
            </div>
            <div class="numero numero-mc">
              <Icone nome="moeda" :tamanho="20" />
              <div><small>Moedas</small><strong>{{ missao.mc }} MC</strong></div>
            </div>
            <div class="numero numero-prazo">
              <Icone nome="relogio" :tamanho="20" />
              <div>
                <small>Prazo</small>
                <strong>{{ status === 'concluida' || !missao.prazo ? '—' : rotuloPrazo(missao.prazo) }}</strong>
              </div>
            </div>
          </div>

          <div class="progresso-linha">
            <strong>Progresso geral</strong>
            <strong class="percentual">{{ progresso }}%</strong>
          </div>
          <div
            class="barra"
            role="progressbar"
            aria-label="Progresso geral da missão"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="progresso"
          >
            <div class="barra-preenchimento" :style="{ width: progresso + '%' }"></div>
          </div>
          <small class="progresso-nota">
            {{ etapasConcluidas(missao) }} de {{ missao.etapas.length }} etapas concluídas
          </small>
        </section>

        <!-- ETAPAS -->
        <section class="card etapas" aria-labelledby="titulo-etapas">
          <h3 id="titulo-etapas">Etapas da Missão</h3>

          <ol class="lista-etapas">
            <li v-for="etapa in missao.etapas" :key="etapa.id">
              <component
                :is="estadoDa(etapa) === 'andamento' ? 'button' : 'div'"
                :type="estadoDa(etapa) === 'andamento' ? 'button' : undefined"
                class="etapa"
                :class="'etapa-' + estadoDa(etapa)"
                @click="estadoDa(etapa) === 'andamento' && abrirEtapa()"
              >
                <span class="etapa-marca" aria-hidden="true">
                  <Icone v-if="estadoDa(etapa) === 'concluida'" nome="check" :tamanho="16" />
                  <Icone v-else-if="estadoDa(etapa) === 'andamento'" nome="play" :tamanho="18" />
                </span>

                <span class="etapa-titulo">{{ etapa.titulo }}</span>

                <span class="etapa-xp"><Icone nome="estrela" :tamanho="12" preenchido />{{ etapa.xp }} XP</span>
                <span v-if="ROTULO_ESTADO[estadoDa(etapa)]" class="etapa-estado">
                  {{ ROTULO_ESTADO[estadoDa(etapa)] }}
                </span>
              </component>
            </li>
          </ol>

          <button v-if="status === 'andamento'" type="button" class="botao-principal" @click="abrirEtapa">
            Continuar Missão
          </button>
          <button v-else-if="status === 'disponivel'" type="button" class="botao-principal" @click="aoParticipar">
            Participar da Missão
          </button>
          <p v-else class="concluida-nota">
            <Icone nome="check" :tamanho="18" />Missão concluída! Veja outras missões para continuar ganhando XP.
          </p>
        </section>
      </div>

      <!-- LATERAL -->
      <aside class="lateral">
        <section class="card sobre">
          <h3>Sobre a missão</h3>
          <dl>
            <div><dt>Categoria</dt><dd>{{ missao.categoria }}</dd></div>
            <div><dt>Dificuldade</dt><dd>{{ missao.dificuldade }}</dd></div>
            <div>
              <dt>Prazo</dt>
              <dd>{{ status === 'concluida' || !missao.prazo ? '—' : rotuloPrazo(missao.prazo) + ' restantes' }}</dd>
            </div>
            <div><dt>Participantes</dt><dd>{{ missao.participantes }} participantes</dd></div>
            <div><dt>XP disponível</dt><dd>{{ xpTotal(missao) }} XP</dd></div>
            <div><dt>Recompensa</dt><dd>{{ missao.mc }} Moedas Verdes</dd></div>
          </dl>
        </section>

        <section class="dica">
          <h3><Icone nome="lampada" :tamanho="18" />Dica da missão</h3>
          <p>{{ missao.dica }}</p>
        </section>
      </aside>
    </div>

    <EtapaModal
      :aberto="modalAberto"
      :etapa="atual"
      :missao="missao"
      @fechar="modalAberto = false"
      @concluir="aoConcluir"
    />
  </div>

  <section v-else class="card nao-encontrada">
    <h2>Missão não encontrada</h2>
    <p>Essa missão não existe ou foi removida.</p>
    <RouterLink to="/missoes" class="botao-principal botao-link">Voltar para Missões</RouterLink>
  </section>
</template>

<style scoped>
.pagina {
  display: grid;
  gap: 16px;
}
.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--texto-suave);
  font-size: 14px;
  text-decoration: none;
}
.voltar:hover {
  color: var(--verde-600);
}
.voltar:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 3px;
  border-radius: 4px;
}
.aviso {
  margin: 0;
  padding: 12px 16px;
  border: 1px solid #bfe8cc;
  border-radius: 12px;
  background: #e6f7ec;
  color: #0f6b34;
  font-size: 14px;
  font-weight: 600;
}

.detalhe {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;
  max-width: 1120px;
}
.principal,
.lateral {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.card {
  padding: 24px;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}

/* ---------- Resumo ---------- */
.tags {
  display: flex;
  gap: 8px;
}
.tag {
  padding: 4px 12px;
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
.resumo h2 {
  margin: 14px 0 10px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f3d22;
}
.descricao {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--texto-suave);
}
.numeros {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.numero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}
.numero small {
  display: block;
  font-size: 12px;
  color: var(--texto-suave);
}
.numero strong {
  font-size: 16px;
  font-weight: 700;
}
.numero-xp {
  background: #fff7de;
}
.numero-xp svg {
  color: #f5b301;
}
.numero-mc {
  background: #e9f8ee;
}
.numero-mc svg {
  color: #16a34a;
}
.numero-prazo {
  background: #f0f4f1;
}
.numero-prazo svg {
  color: var(--texto);
}

.progresso-linha {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
}
.percentual {
  color: #15803d;
}
.barra {
  height: 12px;
  border-radius: 99px;
  background: #d6eadb;
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #15803d, #22c55e);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.progresso-nota {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--texto-suave);
}

/* ---------- Etapas ---------- */
.etapas h3 {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 700;
}
.lista-etapas {
  display: grid;
  gap: 10px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
}
.etapa {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #f1f6f2;
  color: var(--texto);
  font: inherit;
  font-size: 15px;
  text-align: left;
}
.etapa-marca {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 1.5px solid #c8d4cb;
  border-radius: 50%;
  background: #fff;
  color: #fff;
}
.etapa-titulo {
  flex: 1;
  min-width: 0;
}
.etapa-xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  color: #8a5a00;
  font-size: 12.5px;
  font-weight: 700;
}
.etapa-xp svg {
  color: #f5b301;
}
.etapa-estado {
  flex: none;
  min-width: 70px;
  color: #15803d;
  font-size: 12.5px;
  font-weight: 600;
  text-align: right;
}
.etapa-concluida .etapa-marca {
  border-color: #22c55e;
  background: #22c55e;
}
.etapa-andamento {
  border-color: #22c55e;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.etapa-andamento:hover {
  box-shadow: 0 6px 18px -10px rgba(22, 163, 74, 0.6);
}
.etapa-andamento:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.etapa-andamento .etapa-marca {
  border-color: #14603a;
  background: #14603a;
}
.etapa-pendente {
  color: var(--texto-suave);
}

.botao-principal {
  display: block;
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #15803d, #22c55e);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: filter 0.15s;
}
.botao-principal:hover {
  filter: brightness(0.94);
}
.botao-principal:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.botao-link {
  display: grid;
  place-items: center;
  max-width: 280px;
  margin-top: 16px;
  text-decoration: none;
}
.concluida-nota {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: #e6f7ec;
  color: #0f6b34;
  font-size: 14px;
  font-weight: 600;
}

/* ---------- Lateral ---------- */
.sobre h3,
.dica h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
}
.sobre dl {
  display: grid;
  gap: 12px;
  margin: 0;
}
.sobre dl div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}
.sobre dt {
  color: var(--texto-suave);
}
.sobre dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}
.dica {
  padding: 20px 24px;
  border: 1px solid #bfe8cc;
  border-radius: 16px;
  background: #e6f7ec;
}
.dica h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f5b2d;
}
.dica p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #1f5a37;
}

.nao-encontrada h2 {
  margin: 0 0 6px;
}
.nao-encontrada p {
  margin: 0;
  color: var(--texto-suave);
}

@media (max-width: 1100px) {
  .detalhe {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 640px) {
  .card {
    padding: 18px;
  }
  .resumo h2 {
    font-size: 26px;
  }
  .numeros {
    grid-template-columns: 1fr;
  }
  .etapa {
    flex-wrap: wrap;
  }
  .etapa-titulo {
    flex-basis: calc(100% - 60px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .barra-preenchimento,
  .etapa-andamento {
    transition: none;
  }
}
</style>
