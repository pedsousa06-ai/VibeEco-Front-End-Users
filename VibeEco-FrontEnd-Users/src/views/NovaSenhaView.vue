<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CampoSenha from '@/components/CampoSenha.vue'
import { limparRecuperacao } from '@/services/recuperacaoSenha'

const router = useRouter()

const senha = ref('')
const confirmacao = ref('')
const erro = ref('')
const carregando = ref(false)
const sucesso = ref(false)
let redirecionar = null

function validar() {
  if (senha.value.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (!/\p{L}/u.test(senha.value) || !/\d/.test(senha.value)) {
    return 'Use letras e números na senha.'
  }
  if (senha.value !== confirmacao.value) return 'As senhas não são iguais.'
  return ''
}

async function salvar() {
  erro.value = validar()
  if (erro.value) return

  carregando.value = true
  try {
    // TODO: enviar a nova senha para a API
    await new Promise((resolve) => setTimeout(resolve, 400)) // simula a chamada
    sucesso.value = true
    redirecionar = setTimeout(() => {
      limparRecuperacao() // encerra o fluxo de recuperação
      router.push({ name: 'tela-acesso', query: { aviso: 'senha-alterada' } })
    }, 1800)
  } finally {
    carregando.value = false
  }
}

onBeforeUnmount(() => clearTimeout(redirecionar))
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

    <h1 class="auth-titulo">Defina sua nova senha</h1>
    <p class="auth-descricao">
      Crie uma nova senha para acessar sua conta. Use pelo menos 8 caracteres, com letras e números.
    </p>

    <form class="auth-form" novalidate @submit.prevent="salvar">
      <CampoSenha
        v-model="senha"
        class="campo-sep"
        rotulo="Nova senha"
        placeholder="Digite sua nova senha"
        :desabilitado="sucesso"
      />
      <CampoSenha
        v-model="confirmacao"
        class="campo-sep"
        rotulo="Confirmar nova senha"
        placeholder="Digite a nova senha novamente"
        :desabilitado="sucesso"
      />

      <p v-if="erro" class="auth-erro" role="alert">{{ erro }}</p>
      <p v-if="sucesso" class="auth-ok" role="status">
        Senha alterada com sucesso! Redirecionando para o login...
      </p>

      <button type="submit" class="auth-botao" :disabled="carregando || sucesso">
        {{ carregando ? 'Salvando...' : 'Salvar nova senha' }}
      </button>
    </form>
  </AuthLayout>
</template>

<style scoped>
.campo-sep + .campo-sep {
  margin-top: 22px;
}
</style>
