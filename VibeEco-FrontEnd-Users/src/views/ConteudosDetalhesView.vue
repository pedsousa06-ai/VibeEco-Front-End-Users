<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icone from '@/components/Icone.vue'
import { concluirConteudo, estiloCapa, obterConteudo } from '@/services/conteudos'

const route = useRoute()
const router = useRouter()

const conteudo = ref(null)
const carregando = ref(true)

// 'revisao' -> 'quiz' -> 'resultado'
const etapa = ref('revisao')
const indice = ref(0)
const selecionada = ref(null)
const acertos = ref(0)
const resultado = ref(null)

const total = computed(() => conteudo.value?.quiz.length ?? 0)
const questao = computed(() => conteudo.value?.quiz[indice.value])
const respondida = computed(() => selecionada.value !== null)
const acertou = computed(() => respondida.value && selecionada.value === questao.value.correta)
const ehUltima = computed(() => indice.value === total.value - 1)
const porcentagem = computed(() => Math.round(((indice.value + (respondida.value ? 1 : 0)) / total.value) * 100))

function estadoOpcao(i) {
  if (!respondida.value) return ''
  if (i === questao.value.correta) return 'correta'
  if (i === selecionada.value) return 'errada'
  return 'neutra'
}

function iniciarQuiz() {
  indice.value = 0
  selecionada.value = null
  acertos.value = 0
  resultado.value = null
  etapa.value = 'quiz'
}

function responder(i) {
  if (respondida.value) return
  selecionada.value = i
  if (i === questao.value.correta) acertos.value++
}

async function avancar() {
  if (!ehUltima.value) {
    indice.value++
    selecionada.value = null
    return
  }
  resultado.value = await concluirConteudo(conteudo.value.id, acertos.value, total.value)
  etapa.value = 'resultado'
}

function voltar() {
  if (etapa.value === 'quiz') etapa.value = 'revisao'
  else router.push({ name: 'conteudos' })
}

const irParaLista = () => router.push({ name: 'conteudos' })

onMounted(async () => {
  conteudo.value = await obterConteudo(route.params.id)
  carregando.value = false
})
</script>

<template>
  <section class="detalhe">
    <p v-if="carregando" class="aviso">Carregando...</p>

    <div v-else-if="!conteudo" class="aviso">
      <p>Não encontramos esse conteúdo.</p>
      <button type="button" class="botao" @click="irParaLista">Voltar aos conteúdos</button>
    </div>

    <template v-else>
      <button v-if="etapa !== 'resultado'" type="button" class="voltar" @click="voltar">
        ← {{ etapa === 'quiz' ? 'Voltar à revisão' : 'Voltar' }}
      </button>

      <!-- REVISÃO -->
      <article v-if="etapa === 'revisao'" class="painel">
        <div class="capa" :style="estiloCapa(conteudo)" role="img" :aria-label="conteudo.titulo" />
        <div class="painel-corpo">
          <span class="tag">{{ conteudo.categoria }}</span>
          <h2>{{ conteudo.titulo }}</h2>
          <p class="meta">
            {{ conteudo.minutos }} min leitura
            <span class="xp"><Icone nome="estrela" :tamanho="13" preenchido />{{ conteudo.xp }} XP</span>
          </p>

          <h3>Revisão rápida</h3>
          <p class="resumo">{{ conteudo.revisao.resumo }}</p>
          <ul class="pontos">
            <li v-for="ponto in conteudo.revisao.pontos" :key="ponto">{{ ponto }}</li>
          </ul>

          <button type="button" class="botao grande" @click="iniciarQuiz">
            {{ conteudo.concluido ? 'Refazer quiz' : 'Começar quiz' }}
          </button>
        </div>
      </article>

      <!-- QUIZ -->
      <div v-else-if="etapa === 'quiz'" class="quiz">
        <div class="progresso-topo">
          <span>Questão {{ indice + 1 }} de {{ total }}</span>
          <span>{{ porcentagem }}% concluído</span>
        </div>
        <div class="barra" role="progressbar" :aria-valuenow="porcentagem" aria-valuemin="0" aria-valuemax="100">
          <div class="barra-preenchida" :style="{ width: porcentagem + '%' }" />
        </div>

        <div class="painel painel-corpo">
          <h2 class="pergunta">{{ questao.pergunta }}</h2>

          <div class="opcoes">
            <button
              v-for="(opcao, i) in questao.opcoes"
              :key="opcao"
              type="button"
              class="opcao"
              :class="estadoOpcao(i)"
              :disabled="respondida"
              @click="responder(i)"
            >
              <span class="marcador">
                <Icone v-if="estadoOpcao(i) === 'correta'" nome="check" :tamanho="14" />
                <Icone v-else-if="estadoOpcao(i) === 'errada'" nome="fechar" :tamanho="14" />
              </span>
              {{ opcao }}
            </button>
          </div>

          <div v-if="respondida" class="feedback" :class="acertou ? 'ok' : 'erro'" role="status">
            <strong>{{ acertou ? 'Resposta correta' : 'Resposta incorreta' }}</strong>
            <p>{{ questao.explicacao }}</p>
          </div>

          <button v-if="respondida" type="button" class="botao grande" @click="avancar">
            {{ ehUltima ? 'Ver resultado' : 'Próxima questão' }}
          </button>
        </div>
      </div>

      <!-- RESULTADO -->
      <div v-else class="painel painel-corpo resultado">
        <h2>{{ resultado.aprovado ? 'Conteúdo concluído!' : 'Quase lá!' }}</h2>
        <p class="placar">Você acertou {{ resultado.acertos }} de {{ resultado.total }} questões.</p>

        <p v-if="resultado.xpGanho > 0" class="xp-ganho"><Icone nome="estrela" :tamanho="26" preenchido />+{{ resultado.xpGanho }} XP</p>
        <p v-else-if="resultado.aprovado" class="resumo">Você já tinha concluído este conteúdo, então não há XP novo desta vez.</p>
        <p v-else class="resumo">Revise o conteúdo e tente de novo para concluir e ganhar XP.</p>

        <div class="acoes">
          <button type="button" class="botao grande" @click="irParaLista">Voltar aos conteúdos</button>
          <button type="button" class="botao grande secundario" @click="etapa = 'revisao'">Rever conteúdo</button>
          <button type="button" class="botao grande secundario" @click="iniciarQuiz">Refazer quiz</button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detalhe {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.aviso {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
  padding: 48px 24px;
  border: 1px dashed var(--borda);
  border-radius: 16px;
  background: #fff;
  text-align: center;
  color: var(--texto-suave);
}

.voltar {
  justify-self: start;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--texto-suave);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.voltar:hover {
  color: var(--texto);
}
.voltar:focus-visible,
.opcao:focus-visible,
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
  border-radius: 8px;
}

.painel {
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.painel-corpo {
  display: grid;
  gap: 12px;
  padding: 24px;
}
.painel-corpo h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.painel-corpo h3 {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 700;
}

.capa {
  height: 190px;
  background-size: cover;
  background-position: center;
}
.tag {
  justify-self: start;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--verde-100);
  color: #0f6b34;
  font-size: 12px;
  font-weight: 600;
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 13px;
  color: var(--texto-suave);
}
.xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8a5a00;
  font-weight: 700;
}
.xp svg {
  color: #f5b301;
}
.resumo {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--texto-suave);
}
.pontos {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  font-size: 14.5px;
  line-height: 1.55;
}
.pontos li::marker {
  color: var(--verde-600);
}

/* quiz */
.progresso-topo {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: var(--texto-suave);
}
.barra {
  height: 8px;
  overflow: hidden;
  border-radius: 99px;
  background: #d6eadb;
}
.barra-preenchida {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a, #4ade80);
  transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.painel-corpo .pergunta {
  font-size: 20px;
}
.opcoes {
  display: grid;
  gap: 10px;
}
.opcao {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 50px;
  padding: 10px 14px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--fundo);
  color: var(--texto);
  font: inherit;
  font-size: 14.5px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.opcao:not(:disabled):hover {
  border-color: var(--verde-600);
}
.opcao:disabled {
  cursor: default;
}
.marcador {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  color: #fff;
}
.opcao.correta {
  border-color: var(--verde-500);
  background: #ecf9f0;
  color: #0f6b34;
}
.opcao.correta .marcador {
  background: var(--verde-500);
}
.opcao.errada {
  border-color: #ef4444;
  background: #fef1f1;
  color: #b91c1c;
}
.opcao.errada .marcador {
  background: #ef4444;
}
.opcao.neutra {
  opacity: 0.65;
}

.feedback {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.5;
}
.feedback p {
  margin: 4px 0 0;
}
.feedback.ok {
  border: 1px solid #bfe3c9;
  background: #ecf9f0;
  color: #0f6b34;
}
.feedback.erro {
  border: 1px solid #f7caca;
  background: #fef1f1;
  color: #b91c1c;
}

/* resultado */
.resultado {
  justify-items: center;
  text-align: center;
}
.placar {
  margin: 0;
  font-size: 16px;
}
.xp-ganho {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #8a5a00;
  font-size: 30px;
  font-weight: 800;
}
.xp-ganho svg {
  color: #f5b301;
}
.acoes {
  display: grid;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  margin-top: 8px;
}

.botao {
  height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: var(--verde-900);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.botao:hover {
  background: var(--verde-950);
}
.botao.grande {
  width: 100%;
  height: 46px;
  background: linear-gradient(90deg, var(--verde-700), var(--verde-600));
}
.botao.grande:hover {
  background: linear-gradient(90deg, var(--verde-900), var(--verde-700));
}
.botao.secundario {
  background: var(--fundo);
  color: var(--texto);
}
.botao.secundario:hover {
  background: var(--verde-100);
}

@media (prefers-reduced-motion: reduce) {
  .barra-preenchida,
  .opcao,
  .botao {
    transition: none;
  }
}
</style>