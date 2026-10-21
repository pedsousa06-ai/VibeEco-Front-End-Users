<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { limparRecuperacao, marcarCodigoVerificado } from '@/services/recuperacaoSenha'

const router = useRouter()

const TAMANHO = 6
const digitos = ref(Array(TAMANHO).fill(''))
const caixas = [] // referências dos 6 <input>, preenchidas pelo :ref no template

const erro = ref('')
const info = ref('')
const carregando = ref(false)
const espera = ref(0) // segundos até poder reenviar
let relogio = null

const completo = computed(() => digitos.value.every((d) => d !== ''))

function focar(i) {
  caixas[i]?.focus()
}

// Distribui os números a partir da caixa i (serve para digitar, colar e autopreencher)
function preencherAPartir(i, texto) {
  const numeros = texto.replace(/\D/g, '').slice(0, TAMANHO - i)
  numeros.split('').forEach((n, k) => (digitos.value[i + k] = n))
  focar(Math.min(i + numeros.length, TAMANHO - 1))
}

function aoDigitar(i, e) {
  const texto = e.target.value.replace(/\D/g, '')
  if (!texto) {
    digitos.value[i] = ''
    e.target.value = ''
    return
  }
  preencherAPartir(i, texto)
  e.target.value = digitos.value[i] // a caixa mostra só um dígito
}

function aoApertarTecla(i, e) {
  if (e.key === 'Backspace' && !digitos.value[i] && i > 0) {
    e.preventDefault()
    digitos.value[i - 1] = ''
    focar(i - 1)
  } else if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault()
    focar(i - 1)
  } else if (e.key === 'ArrowRight' && i < TAMANHO - 1) {
    e.preventDefault()
    focar(i + 1)
  }
}

function aoColar(i, e) {
  e.preventDefault()
  preencherAPartir(i, e.clipboardData.getData('text'))
}

async function confirmar() {
  erro.value = ''
  info.value = ''
  if (!completo.value) {
    erro.value = 'Digite os 6 dígitos do código.'
    focar(digitos.value.findIndex((d) => d === ''))
    return
  }
  carregando.value = true
  try {
    // TODO: validar o código (digitos.value.join('')) na API
    await new Promise((resolve) => setTimeout(resolve, 400)) // simula a chamada
    marcarCodigoVerificado() // libera a próxima etapa do fluxo
    router.push('/nova-senha')
  } finally {
    carregando.value = false
  }
}

function reenviar() {
  if (espera.value > 0) return
  // TODO: pedir um novo código à API
  digitos.value = Array(TAMANHO).fill('')
  erro.value = ''
  info.value = 'Enviamos um novo código para o seu e-mail.'
  focar(0)

  espera.value = 30
  relogio = setInterval(() => {
    espera.value -= 1
    if (espera.value <= 0) clearInterval(relogio)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(relogio))
</script>

<template>
  <AuthLayout>
    <RouterLink to="/" class="auth-voltar" @click="limparRecuperacao">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      Voltar ao login
    </RouterLink>

    <h1 class="auth-titulo">Insira o código</h1>
    <p class="auth-descricao">
      Digite o código de 6 dígitos enviado ao seu e-mail para continuar a recuperação da sua senha.
    </p>

    <form class="auth-form" novalidate @submit.prevent="confirmar">
      <span id="rotulo-codigo" class="auth-rotulo">Código de recuperação</span>

      <div class="codigo-linha" role="group" aria-labelledby="rotulo-codigo">
        <input
          v-for="(_, i) in digitos"
          :key="i"
          :ref="(el) => (caixas[i] = el)"
          :value="digitos[i]"
          class="codigo-caixa"
          type="text"
          inputmode="numeric"
          placeholder="–"
          :autocomplete="i === 0 ? 'one-time-code' : 'off'"
          :aria-label="`Dígito ${i + 1} de ${TAMANHO}`"
          @input="aoDigitar(i, $event)"
          @keydown="aoApertarTecla(i, $event)"
          @paste="aoColar(i, $event)"
          @focus="$event.target.select()"
        />
      </div>

      <p v-if="erro" class="auth-erro" role="alert">{{ erro }}</p>

      <button type="submit" class="auth-botao" :disabled="carregando">
        {{ carregando ? 'Confirmando...' : 'Confirmar código' }}
      </button>
    </form>

    <p class="reenvio">
      Não recebeu o código?
      <button type="button" class="reenviar" :disabled="espera > 0" @click="reenviar">
        {{ espera > 0 ? `Reenviar em ${espera}s` : 'Reenviar código' }}
      </button>
    </p>
    <p v-if="info" class="auth-ok reenvio-info" role="status">{{ info }}</p>
  </AuthLayout>
</template>

<style scoped>
.codigo-linha {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 13px;
  margin-bottom: 19px;
}
.codigo-caixa {
  width: 100%;
  min-width: 0;
  height: 48px;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #cde5d3;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: #12261a;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.codigo-caixa::placeholder {
  color: #9aa8a0;
  font-weight: 400;
}
.codigo-caixa:focus {
  outline: 0;
  border-color: #1b8a4b;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

.reenvio {
  margin: 30px 0 0;
  font-size: 14px;
  text-align: center;
  color: #6f7f75;
}
.reenviar {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 700;
  color: #14532d;
  cursor: pointer;
}
.reenviar:hover:not(:disabled) {
  text-decoration: underline;
}
.reenviar:focus-visible {
  outline: 2px solid #1b8a4b;
  outline-offset: 2px;
  border-radius: 2px;
}
.reenviar:disabled {
  color: #8a9a90;
  cursor: default;
}
.reenvio-info {
  text-align: center;
}

@media (max-width: 600px) {
  .codigo-linha {
    gap: 8px;
  }
  .codigo-caixa {
    height: 44px;
    font-size: 20px;
  }
}
</style>
