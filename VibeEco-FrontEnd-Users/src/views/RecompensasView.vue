<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icone from '@/components/Icone.vue'
import { usuario } from '@/services/usuario'
import {
  estadoDe,
  nivelDoUsuario,
  recompensasLista,
  resgatar,
  resgates,
  totalResgatado,
} from '@/services/recompensas'

const reduzMovimento =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- ABAS ----------
const aba = ref('disponiveis')

// ---------- SALDO ANIMADO ----------
const saldoExibido = ref(0)
let rafId
function animarSaldo(de, para, duracao = 900) {
  cancelAnimationFrame(rafId)
  if (reduzMovimento) {
    saldoExibido.value = para
    return
  }
  const inicio = performance.now()
  const passo = (agora) => {
    const t = Math.min((agora - inicio) / duracao, 1)
    const suave = 1 - Math.pow(1 - t, 3)
    saldoExibido.value = Math.round(de + (para - de) * suave)
    if (t < 1) rafId = requestAnimationFrame(passo)
  }
  rafId = requestAnimationFrame(passo)
}
watch(
  () => usuario.mc,
  (novo) => animarSaldo(saldoExibido.value, novo)
)

// ---------- VITRINE ----------
const vitrine = computed(() =>
  recompensasLista.map((r) => {
    const estado = estadoDe(r)
    return {
      ...r,
      estado,
      faltam: Math.max(0, r.preco - usuario.mc),
      nivelInsuficiente: nivelDoUsuario() < r.nivelMinimo,
    }
  })
)

function rotuloBotao(r) {
  if (r.estado === 'disponivel') return 'Resgatar'
  if (r.estado === 'saldo') return `Faltam ${r.faltam} MC`
  if (r.estado === 'esgotado') return 'Esgotado'
  return 'Bloqueado'
}

function estiloImagem(item) {
  return item.imagem ? { backgroundImage: `url(${item.imagem})` } : null
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ---------- MODAL ----------
const selecionada = ref(null)
const fase = ref('confirmar') // 'confirmar' | 'sucesso'
const ultimoResgate = ref(null)
const erro = ref('')
const dialogo = ref(null)
let gatilho = null

const cores = ['#16a34a', '#f5b301', '#7c3aed', '#ea580c']
const confetes = Array.from({ length: 14 }, (_, i) => ({
  i,
  angulo: Math.round((360 / 14) * i),
  cor: cores[i % cores.length],
}))

function focarInicio() {
  nextTick(() => dialogo.value?.querySelector('[data-foco]')?.focus())
}

function abrirConfirmacao(recompensa, evento) {
  if (recompensa.estado !== 'disponivel') return
  gatilho = evento?.currentTarget ?? null
  selecionada.value = recompensa
  fase.value = 'confirmar'
  erro.value = ''
  focarInicio()
}

function confirmar() {
  const resultado = resgatar(selecionada.value.id)
  if (!resultado.ok) {
    erro.value = resultado.motivo
    return
  }
  ultimoResgate.value = resultado.resgate
  fase.value = 'sucesso'
  focarInicio()
}

function fechar() {
  selecionada.value = null
  nextTick(() => gatilho?.focus?.())
}

function irParaResgatadas() {
  selecionada.value = null
  aba.value = 'resgatadas'
}

// Esc fecha e Tab fica preso dentro do modal
function aoTeclar(evento) {
  if (evento.key === 'Escape') {
    evento.stopPropagation()
    fechar()
    return
  }
  if (evento.key !== 'Tab') return
  const focaveis = dialogo.value?.querySelectorAll('button:not([disabled])')
  if (!focaveis?.length) return
  const primeiro = focaveis[0]
  const ultimo = focaveis[focaveis.length - 1]
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault()
    primeiro.focus()
  }
}

// Trava a rolagem da página enquanto o modal está aberto
watch(selecionada, (valor) => {
  document.body.style.overflow = valor ? 'hidden' : ''
})

// ---------- COPIAR CÓDIGO ----------
const copiado = ref('')
let timerCopia
async function copiarCodigo(codigo) {
  try {
    await navigator.clipboard.writeText(codigo)
    copiado.value = codigo
    clearTimeout(timerCopia)
    timerCopia = setTimeout(() => (copiado.value = ''), 1800)
  } catch {
    // Sem permissão de área de transferência: o código continua visível na tela
  }
}

onMounted(() => animarSaldo(0, usuario.mc))
onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(timerCopia)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="recompensas">
    <!-- SALDO -->
    <section class="saldo entrada" aria-label="Saldo de Moedas Verdes">
      <div class="saldo-texto">
        <small>Seu saldo atual</small>
        <div class="saldo-valor">
          <strong>{{ saldoExibido }}</strong>
          <span>Moedas Verdes</span>
          <Icone nome="moeda" :tamanho="30" class="saldo-moeda" />
        </div>
        <small class="saldo-detalhe">Acumuladas por missões, desafios e conteúdos</small>
      </div>

      <div class="saldo-total">
        <small>Total resgatado</small>
        <strong>{{ totalResgatado }} MC</strong>
      </div>
    </section>

    <!-- ABAS -->
    <div class="abas entrada" :style="{ '--i': 1 }" role="tablist" aria-label="Tipo de recompensa">
      <button
        type="button"
        role="tab"
        class="aba"
        :class="{ 'aba-ativa': aba === 'disponiveis' }"
        :aria-selected="aba === 'disponiveis'"
        @click="aba = 'disponiveis'"
      >
        Disponíveis
      </button>
      <button
        type="button"
        role="tab"
        class="aba"
        :class="{ 'aba-ativa': aba === 'resgatadas' }"
        :aria-selected="aba === 'resgatadas'"
        @click="aba = 'resgatadas'"
      >
        Resgatadas
        <span v-if="resgates.length" class="aba-contador">{{ resgates.length }}</span>
      </button>
    </div>

    <!-- DISPONÍVEIS -->
    <section v-if="aba === 'disponiveis'" class="grade" aria-label="Recompensas disponíveis">
      <article
        v-for="(r, i) in vitrine"
        :key="r.id"
        class="card recompensa entrada"
        :class="'estado-' + r.estado"
        :style="{ '--i': i + 2 }"
      >
        <div class="midia" :class="'tema-' + r.tema" :style="estiloImagem(r)">
          <span v-if="!r.imagem" class="midia-emoji" aria-hidden="true">{{ r.emoji }}</span>
          <span class="tipo">{{ r.tipo }}</span>

          <span v-if="r.estado === 'nivel'" class="cadeado" aria-hidden="true">
            <Icone nome="cadeado" :tamanho="26" />
          </span>
          <span v-else-if="r.estado === 'esgotado'" class="selo-esgotado">Esgotado</span>
        </div>

        <div class="corpo">
          <h3>{{ r.titulo }}</h3>

          <div class="linha">
            <span class="preco"><Icone nome="moeda" :tamanho="18" />{{ r.preco }}</span>
            <small class="nivel" :class="{ 'nivel-faltando': r.nivelInsuficiente }">
              Nível {{ r.nivelMinimo }}+ necessário
            </small>
          </div>

          <small v-if="r.estoque !== null && r.estoque > 0 && r.estoque <= 5" class="estoque">
            Restam só {{ r.estoque }}
          </small>

          <button
            type="button"
            class="botao"
            :disabled="r.estado !== 'disponivel'"
            @click="abrirConfirmacao(r, $event)"
          >
            {{ rotuloBotao(r) }}
          </button>
        </div>
      </article>
    </section>

    <!-- RESGATADAS -->
    <section v-else class="lista" aria-label="Recompensas resgatadas">
      <article
        v-for="(r, i) in resgates"
        :key="r.id"
        class="card resgatada entrada"
        :style="{ '--i': i }"
      >
        <div class="resgatada-midia" :class="'tema-' + r.tema" :style="estiloImagem(r)" aria-hidden="true">
          <span v-if="!r.imagem">{{ r.emoji }}</span>
        </div>

        <div class="resgatada-info">
          <strong>{{ r.nome }}</strong>
          <small>{{ r.tipo }} · Resgatado em {{ formatarData(r.data) }}</small>
        </div>

        <span class="preco"><Icone nome="moeda" :tamanho="18" />{{ r.preco }}</span>

        <button
          type="button"
          class="codigo-botao"
          :aria-label="`Copiar código ${r.codigo}`"
          @click="copiarCodigo(r.codigo)"
        >
          <code>{{ r.codigo }}</code>
          <span v-if="copiado === r.codigo" class="copiado"><Icone nome="check" :tamanho="14" />Copiado</span>
          <Icone v-else nome="copiar" :tamanho="14" />
        </button>
      </article>

      <div v-if="!resgates.length" class="vazio entrada">
        <Icone nome="presente" :tamanho="40" />
        <strong>Você ainda não resgatou nada</strong>
        <p>Use suas Moedas Verdes para trocar por recompensas.</p>
        <button type="button" class="botao botao-inline" @click="aba = 'disponiveis'">Ver recompensas</button>
      </div>
    </section>

    <!-- MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selecionada" class="modal-fundo" @click.self="fechar">
          <div
            ref="dialogo"
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            @keydown="aoTeclar"
          >
            <!-- Confirmar -->
            <template v-if="fase === 'confirmar'">
              <div class="modal-icone"><Icone nome="sacola" :tamanho="34" /></div>
              <h2 id="modal-titulo">Confirmar Resgate</h2>
              <p>
                Você deseja resgatar <strong>{{ selecionada.titulo }}</strong> por
                <strong>{{ selecionada.preco }} Moedas Verdes</strong>?
              </p>
              <p class="modal-saldo">
                Saldo depois do resgate: <strong>{{ usuario.mc - selecionada.preco }} MC</strong>
              </p>
              <p v-if="erro" class="modal-erro" role="alert">{{ erro }}</p>

              <div class="modal-acoes">
                <button type="button" class="botao botao-suave" data-foco @click="fechar">Cancelar</button>
                <button type="button" class="botao" @click="confirmar">Confirmar Resgate</button>
              </div>
            </template>

            <!-- Sucesso -->
            <template v-else>
              <div class="modal-icone modal-icone-ok">
                <Icone nome="check" :tamanho="34" />
                <span
                  v-for="c in confetes"
                  :key="c.i"
                  class="confete"
                  :style="{ '--a': c.angulo + 'deg', '--c': c.cor }"
                  aria-hidden="true"
                ></span>
              </div>
              <h2 id="modal-titulo">Resgate realizado!</h2>
              <p><strong>{{ ultimoResgate.nome }}</strong> é seu. Guarde o código abaixo:</p>

              <button
                type="button"
                class="codigo-botao codigo-grande"
                :aria-label="`Copiar código ${ultimoResgate.codigo}`"
                @click="copiarCodigo(ultimoResgate.codigo)"
              >
                <code>{{ ultimoResgate.codigo }}</code>
                <span v-if="copiado === ultimoResgate.codigo" class="copiado">
                  <Icone nome="check" :tamanho="14" />Copiado
                </span>
                <Icone v-else nome="copiar" :tamanho="14" />
              </button>

              <p class="modal-saldo">Saldo atual: <strong>{{ usuario.mc }} MC</strong></p>

              <div class="modal-acoes">
                <button type="button" class="botao botao-suave" @click="fechar">Fechar</button>
                <button type="button" class="botao" data-foco @click="irParaResgatadas">Ver resgatadas</button>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.recompensas {
  display: grid;
  gap: 24px;
}

/* ---------- BASE ---------- */
.card {
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.preco {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0f5a2c;
  font-size: 22px;
  font-weight: 800;
}
.preco svg {
  color: #d97706;
}

.botao {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #0f6b34, #1fa856);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
}
.botao:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
  box-shadow: 0 8px 18px -8px rgba(15, 107, 52, 0.65);
}
.botao:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.botao:disabled {
  background: #e8f1ea;
  color: #8aa393;
  cursor: not-allowed;
}
.botao-suave {
  background: #eef6f0;
  color: #1f5d37;
}
.botao-suave:hover:not(:disabled) {
  box-shadow: none;
  filter: none;
  background: #e1efe5;
}
.botao-inline {
  width: auto;
  margin-top: 6px;
  padding: 10px 20px;
}

/* temas de fundo (usados quando não há foto) */
.tema-verde {
  background-image: linear-gradient(135deg, #bbf7d0, #4ade80);
}
.tema-laranja {
  background-image: linear-gradient(135deg, #fed7aa, #fb923c);
}
.tema-terra {
  background-image: linear-gradient(135deg, #d6c4a8, #8b6f4e);
}
.tema-azul {
  background-image: linear-gradient(135deg, #bfdbfe, #60a5fa);
}

/* ---------- SALDO ---------- */
.saldo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 28px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(110deg, #0c4a25 0%, #117a3d 70%, #1a9a4e 100%);
  box-shadow: 0 14px 30px -14px rgba(13, 95, 49, 0.6);
}
.saldo::before {
  content: '';
  position: absolute;
  top: -120px;
  right: 180px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}
.saldo > * {
  position: relative;
}
.saldo-texto small {
  font-size: 14px;
  opacity: 0.85;
}
.saldo-detalhe {
  display: block;
  font-size: 12px !important;
  opacity: 0.7 !important;
}
.saldo-valor {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
}
.saldo-valor strong {
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.saldo-valor span {
  color: #86efac;
  font-size: 24px;
  font-weight: 700;
}
.saldo-moeda {
  color: #fde68a;
}
.saldo-total {
  display: grid;
  gap: 2px;
  padding: 12px 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
}
.saldo-total small {
  font-size: 12px;
  opacity: 0.8;
}
.saldo-total strong {
  font-size: 24px;
  font-weight: 800;
}

/* ---------- ABAS ---------- */
.abas {
  display: flex;
  justify-self: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #e8f1ea;
}
.aba {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
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

/* ---------- GRADE ---------- */
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.recompensa {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.recompensa.estado-disponivel:hover {
  transform: translateY(-4px);
  border-color: #bfe0c8;
  box-shadow: 0 16px 30px -16px rgba(18, 38, 26, 0.35);
}

.midia {
  position: relative;
  display: grid;
  place-items: center;
  height: 176px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.midia-emoji {
  font-size: 64px;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18));
  transition: transform 0.3s;
}
.recompensa.estado-disponivel:hover .midia-emoji {
  transform: scale(1.12) rotate(-4deg);
}
.tipo {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(12, 74, 37, 0.88);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.cadeado {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(20, 30, 24, 0.45);
  color: #fff;
}
.selo-esgotado {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(20, 30, 24, 0.5);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.corpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.corpo h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}
.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.nivel {
  font-size: 12px;
  color: var(--texto-suave);
}
.nivel-faltando {
  color: #b45309;
  font-weight: 600;
}
.estoque {
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
}
.corpo .botao {
  margin-top: auto;
}

.estado-nivel .corpo h3,
.estado-nivel .preco,
.estado-esgotado .corpo h3,
.estado-esgotado .preco {
  opacity: 0.6;
}

/* ---------- RESGATADAS ---------- */
.lista {
  display: grid;
  gap: 12px;
}
.resgatada {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.resgatada:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.resgatada-midia {
  display: grid;
  place-items: center;
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
  font-size: 26px;
}
.resgatada-info {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}
.resgatada-info strong {
  font-size: 15px;
}
.resgatada-info small {
  color: var(--texto-suave);
  font-size: 12px;
}
.resgatada .preco {
  font-size: 18px;
}

.codigo-botao {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px dashed #9bcaa9;
  border-radius: 10px;
  background: #f1f8f3;
  color: #0f5a2c;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.codigo-botao:hover {
  background: #e3f1e8;
}
.codigo-botao:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.codigo-botao code {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.codigo-grande {
  justify-self: center;
  margin: 6px 0 2px;
  padding: 12px 18px;
}
.codigo-grande code {
  font-size: 18px;
}
.copiado {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
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

/* ---------- MODAL ---------- */
.modal-fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(10, 30, 18, 0.55);
  backdrop-filter: blur(3px);
}
.modal {
  display: grid;
  gap: 10px;
  width: min(440px, 100%);
  padding: 28px 24px 24px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.45);
  text-align: center;
}
.modal h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.modal p {
  margin: 0;
  color: #3d4f44;
  font-size: 14px;
  line-height: 1.5;
}
.modal-saldo {
  font-size: 13px !important;
  color: var(--texto-suave) !important;
}
.modal-erro {
  padding: 8px 12px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c !important;
  font-weight: 600;
}
.modal-icone {
  position: relative;
  display: grid;
  place-items: center;
  justify-self: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e3f5ea;
  color: #0f6b34;
}
.modal-icone-ok {
  background: #16a34a;
  color: #fff;
  animation: pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) backwards;
}
.modal-acoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.confete {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  margin: -4px;
  border-radius: 2px;
  background: var(--c);
  pointer-events: none;
  animation: explodir 0.9s ease-out 0.15s forwards;
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal {
  transform: translateY(12px) scale(0.95);
}
.modal-leave-to .modal {
  transform: scale(0.97);
}

/* ---------- ANIMAÇÕES ---------- */
.entrada {
  animation: entrar 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: calc(var(--i, 0) * 70ms);
}
@keyframes entrar {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.3); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes explodir {
  0%   { opacity: 1; transform: rotate(var(--a)) translateY(0) scale(1); }
  100% { opacity: 0; transform: rotate(var(--a)) translateY(-78px) scale(0.6); }
}
.saldo-moeda {
  animation: girar 5s ease-in-out infinite;
}
@keyframes girar {
  0%, 80%, 100% { transform: rotateY(0); }
  90%           { transform: rotateY(180deg); }
}

/* ---------- RESPONSIVO ---------- */
@media (max-width: 700px) {
  .saldo {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
  }
  .saldo-valor strong {
    font-size: 38px;
  }
  .saldo-total {
    width: 100%;
    text-align: left;
  }
  .resgatada {
    flex-wrap: wrap;
  }
  .resgatada-info {
    flex-basis: calc(100% - 80px);
  }
  .modal-acoes {
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
  .confete {
    display: none;
  }
}
</style>
