<script setup>
import { computed, ref, watch } from 'vue'
import { Building2, ChevronDown, ChevronUp, Crown, Globe, Medal, Star, Trophy, TrendingUp, Users } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import NumeroAnimado from '@/components/NumeroAnimado.vue'
import { ESCOPOS, montarRanking } from '@/services/ranking'

const ICONES_ABA = { geral: Globe, instituicao: Building2, grupo: Users }
const LIMITE = 7 // quantas posições aparecem antes de "Ver mais"

const escopoId = ref('geral')
const expandido = ref(false)
watch(escopoId, () => (expandido.value = false))

const escopo = computed(() => ESCOPOS.find((e) => e.id === escopoId.value))
// Recalcula quando a aba ou o XP da usuária mudam (ex.: ao concluir uma missão)
const ranking = computed(() => montarRanking(escopoId.value))

// Pódio na ordem visual: 2º, 1º, 3º
const podio = computed(() => {
  const [primeiro, segundo, terceiro] = ranking.value.lista
  return [segundo, primeiro, terceiro].filter(Boolean)
})

const linhas = computed(() => {
  const { lista, eu } = ranking.value
  const visiveis = expandido.value ? lista : lista.slice(0, LIMITE)
  // Fora da lista curta, a posição da usuária aparece separada no final (como no Figma)
  if (!visiveis.some((p) => p.voce)) return [...visiveis, { id: 'separador', separador: true }, eu]
  return visiveis
})
const podeExpandir = computed(() => ranking.value.lista.length > LIMITE)

const COR_MEDALHA = { 1: '#e8b10a', 2: '#8a9ca8', 3: '#b37a35' }

// Setas esquerda/direita trocam de aba (padrão de abas acessíveis)
function aoApertarTecla(e) {
  const i = ESCOPOS.findIndex((a) => a.id === escopoId.value)
  const proxima = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null
  if (proxima === null) return
  e.preventDefault()
  const alvo = ESCOPOS[(proxima + ESCOPOS.length) % ESCOPOS.length]
  escopoId.value = alvo.id
  document.getElementById(`aba-${alvo.id}`)?.focus()
}
</script>

<template>
  <div class="ranking">
    <!-- ABAS -->
    <div class="abas" role="tablist" aria-label="Escopo do ranking" @keydown="aoApertarTecla">
      <button
        v-for="aba in ESCOPOS"
        :id="`aba-${aba.id}`"
        :key="aba.id"
        type="button"
        role="tab"
        class="aba"
        :class="{ 'aba-ativa': escopoId === aba.id }"
        :aria-selected="escopoId === aba.id"
        :tabindex="escopoId === aba.id ? 0 : -1"
        aria-controls="painel-ranking"
        @click="escopoId = aba.id"
      >
        <component :is="ICONES_ABA[aba.id]" :size="16" aria-hidden="true" />
        {{ aba.nome }}
      </button>
    </div>

    <div id="painel-ranking" role="tabpanel" :aria-labelledby="`aba-${escopoId}`" class="painel">
      <!-- PÓDIO -->
      <section :key="escopoId" class="podio" aria-labelledby="titulo-podio">
        <h2 id="titulo-podio">Top 3 da Semana</h2>

        <div class="podio-colunas">
          <div v-for="p in podio" :key="p.id" class="coluna" :class="'lugar-' + p.posicao">
            <div class="avatar-podio">
              <Crown v-if="p.posicao === 1" class="coroa" :size="26" aria-hidden="true" />
              <span class="avatar-anel" aria-hidden="true">{{ p.iniciais }}</span>
            </div>
            <strong class="podio-nome">{{ p.nome }}</strong>
            <small class="podio-xp"><NumeroAnimado :valor="p.xp" /> XP</small>

            <div class="bloco">
              <Medal :size="22" aria-hidden="true" />
              <span>#{{ p.posicao }}</span>
              <span class="so-leitor">{{ p.posicao }}º lugar: {{ p.nome }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SUA POSIÇÃO -->
      <section class="voce" aria-label="Sua posição no ranking">
        <span class="voce-posicao">#{{ ranking.eu.posicao }}</span>
        <span class="avatar avatar-voce" aria-hidden="true">{{ ranking.eu.iniciais }}</span>
        <div class="voce-info">
          <strong>Você — {{ ranking.eu.nome }}</strong>
          <small>Nível {{ ranking.eu.nivel }} · <NumeroAnimado :valor="ranking.eu.xp" /> XP</small>
        </div>

        <div class="voce-acao">
          <span class="voce-top"><TrendingUp :size="16" aria-hidden="true" />Top {{ ranking.percentual }}% {{ escopo.sufixo }}</span>
          <RouterLink to="/recompensas" class="botao">Recompensas</RouterLink>
        </div>
      </section>

      <!-- CLASSIFICAÇÃO -->
      <section class="tabela" role="table" aria-label="Classificação">
        <div class="linha linha-cabecalho" role="row">
          <span role="columnheader">#</span>
          <span role="columnheader">Usuário</span>
          <span role="columnheader" class="col-nivel">Nível</span>
          <span role="columnheader" class="col-numero">XP</span>
          <span role="columnheader" class="col-numero col-conquistas">Conquistas</span>
        </div>

        <div v-auto-animate class="corpo" role="rowgroup">
          <template v-for="item in linhas" :key="item.id">
            <div v-if="item.separador" class="separador" role="presentation" aria-hidden="true">···</div>

            <div v-else class="linha" :class="{ 'linha-voce': item.voce }" role="row">
              <span class="col-posicao" role="cell">
                <Medal
                  v-if="item.posicao <= 3"
                  :size="22"
                  :color="COR_MEDALHA[item.posicao]"
                  :aria-label="`${item.posicao}º lugar`"
                  role="img"
                />
                <template v-else>#{{ item.posicao }}</template>
              </span>

              <span class="col-usuario" role="cell">
                <span class="avatar" aria-hidden="true">{{ item.iniciais }}</span>
                <span class="usuario-texto">
                  <strong>
                    {{ item.nome }}<small v-if="item.voce" class="tag-voce"> (você)</small>
                  </strong>
                  <small>{{ item.instituicao }}<span class="so-celular"> · Nível {{ item.nivel }}</span></small>
                </span>
              </span>

              <span class="col-nivel" role="cell">Nível {{ item.nivel }}</span>

              <span class="col-numero col-xp" role="cell">
                <Star :size="13" fill="currentColor" aria-hidden="true" />{{ item.xp.toLocaleString('pt-BR') }}
              </span>

              <span class="col-numero col-conquistas" role="cell">
                <Trophy :size="13" aria-hidden="true" /><strong>{{ item.conquistas }}</strong>
              </span>
            </div>
          </template>
        </div>

        <button v-if="podeExpandir" type="button" class="ver-mais" :aria-expanded="expandido" @click="expandido = !expandido">
          {{ expandido ? 'Ver menos' : 'Ver mais posições' }}
          <component :is="expandido ? ChevronUp : ChevronDown" :size="16" aria-hidden="true" />
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ranking {
  display: grid;
  gap: 20px;
  max-width: 1500px;
}
.painel {
  display: grid;
  gap: 20px;
}

/* ---------- ABAS ---------- */
.abas {
  display: inline-flex;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  padding: 4px;
  overflow-x: auto;
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
.aba-ativa svg {
  color: var(--verde-600);
}

/* ---------- PÓDIO ---------- */
.podio {
  position: relative;
  padding: 28px 24px 0;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #0f4524 0%, #145c2f 55%, #17702f 100%);
  color: #fff;
  box-shadow: 0 14px 30px -16px rgba(13, 95, 49, 0.7);
}
.podio::before,
.podio::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}
.podio::before {
  top: -120px;
  left: -80px;
  width: 300px;
  height: 300px;
}
.podio::after {
  right: -60px;
  bottom: -100px;
  width: 260px;
  height: 260px;
}
.podio h2 {
  position: relative;
  margin: 0 0 22px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.podio-colunas {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
}
.coluna {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: clamp(84px, 28vw, 120px);
  text-align: center;
  animation: aparecer 0.5s ease both;
}
.avatar-podio {
  position: relative;
  margin-bottom: 8px;
}
.avatar-anel {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border: 3px solid var(--cor-lugar);
  border-radius: 50%;
  background: #3d6b4d;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--cor-lugar) 22%, transparent);
}
.coroa {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%) rotate(-8deg);
  color: #f5c518;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
}
.podio-nome {
  font-size: 13.5px;
  line-height: 1.25;
}
.podio-xp {
  margin: 2px 0 8px;
  font-size: 12px;
  opacity: 0.8;
}
.bloco {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 2px;
  width: 100%;
  padding-top: 12px;
  box-sizing: border-box;
  border-radius: 10px 10px 0 0;
  background: var(--cor-lugar);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  transform-origin: bottom;
  animation: subir 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both;
}
.lugar-1 {
  --cor-lugar: #e8b10a;
  animation-delay: 0.25s;
}
.lugar-1 .bloco {
  height: 144px;
  animation-delay: 0.25s;
  background: linear-gradient(180deg, #f0bd1a, #d9a206);
}
.lugar-2 {
  --cor-lugar: #8a9ca8;
  animation-delay: 0.15s;
}
.lugar-2 .bloco {
  height: 112px;
  animation-delay: 0.15s;
}
.lugar-3 {
  --cor-lugar: #b37a35;
}
.lugar-3 .bloco {
  height: 96px;
}

@keyframes subir {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ---------- SUA POSIÇÃO ---------- */
.voce {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border: 1.5px solid #4ade80;
  border-radius: 16px;
  background: #ddfbe8;
}
.voce-posicao {
  min-width: 52px;
  color: #0f5b2d;
  font-size: 26px;
  font-weight: 800;
}
.voce-info {
  flex: 1;
  min-width: 0;
}
.voce-info strong {
  display: block;
  color: #0f5b2d;
  font-size: 15.5px;
}
.voce-info small {
  font-size: 12.5px;
  color: #2d6a45;
}
.voce-acao {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.voce-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0f5b2d;
  font-size: 14px;
  font-weight: 500;
}
.botao {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: #14603a;
  color: #fff;
  font-size: 14.5px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
}
.botao:hover {
  background: #104d2f;
}
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}

/* ---------- AVATAR ---------- */
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #0f7a3b);
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
}
.avatar-voce {
  width: 42px;
  height: 42px;
}

/* ---------- TABELA ---------- */
.tabela {
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
}
.linha {
  display: grid;
  grid-template-columns: 72px minmax(0, 2.2fr) minmax(0, 1fr) 120px 130px;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
}
.linha-cabecalho {
  padding-block: 14px;
  border-bottom: 1px solid var(--borda);
  background: #f4f8f5;
  color: var(--texto-suave);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.corpo .linha:nth-child(even) {
  background: #f3f8f4;
}
.linha-voce,
.corpo .linha-voce:nth-child(even) {
  background: #ddfbe8;
}
.corpo .linha {
  transition: background 0.15s;
}
.corpo .linha:hover {
  background: #e8f4eb;
}
.corpo .linha-voce:hover {
  background: #d2f6e0;
}

.col-posicao {
  color: var(--texto-suave);
  font-size: 18px;
  font-weight: 700;
}
.col-usuario {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.usuario-texto {
  min-width: 0;
}
.usuario-texto strong {
  display: block;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.usuario-texto > small {
  font-size: 12px;
  color: var(--texto-suave);
}
.tag-voce {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
}
.linha-voce .usuario-texto strong {
  color: #0f5b2d;
}
.col-nivel {
  color: var(--texto-suave);
}
.col-numero {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  text-align: right;
}
.linha-cabecalho .col-numero {
  display: block;
}
.col-xp {
  color: #8a5a00;
  font-weight: 700;
}
.col-xp svg {
  color: #f5b301;
}
.col-conquistas svg {
  color: #d9a206;
}
.so-celular {
  display: none;
}
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.separador {
  padding: 4px 0;
  border-top: 1px dashed var(--borda);
  color: var(--texto-suave);
  font-size: 18px;
  letter-spacing: 0.3em;
  text-align: center;
}
.ver-mais {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  border: 0;
  border-top: 1px solid var(--borda);
  background: #fff;
  color: var(--verde-600);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.ver-mais:hover {
  background: #f3f8f4;
}
.ver-mais:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: -4px;
}

/* ---------- CELULAR ---------- */
@media (max-width: 760px) {
  .linha {
    grid-template-columns: 48px minmax(0, 1fr) 84px;
    padding: 12px 14px;
  }
  .col-nivel,
  .col-conquistas {
    display: none;
  }
  .so-celular {
    display: inline;
  }
  .voce {
    flex-wrap: wrap;
  }
  .voce-acao {
    width: 100%;
    justify-content: space-between;
  }
}
@media (prefers-reduced-motion: reduce) {
  .coluna,
  .bloco {
    animation: none;
  }
  .aba,
  .corpo .linha {
    transition: none;
  }
}
</style>
