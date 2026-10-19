<script setup>
import { ref, computed } from 'vue'

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmaSenha = ref('')

//Controla quais campos estão visiveis (Olinho)
const mostrar = ref({
  atual: false,
  nova: false,
  confirma: false
})

function alternar(campo) {
  mostrar.value[campo] = !mostrar.value[campo]
}

function criarSenha(){
  console.log('criar senha')
}
</script>

<template>
      <div class="pagina-primeiro-acesso">
    <img class="logo" src="/logo-principal.png" alt="VibeEco">
 
    <div class="caixa-troca-senha">
      <RouterLink to="/" class="voltar">&larr; Voltar ao login</RouterLink>

      <h2>Crie uma nova senha</h2>
      <p class="subtitulo">
        Defina uma senha forte para proteger o seu acesso à plataforma
      </p>

      <form @submit.prevent="criarSenha">
        <! -- SENHA ATUAL -- >
        <label for="senha-atual">Senha atual</label>
        <div class="campo-senha">
          <input
           :type="mostrar.atual ? 'text' : 'password'"
           id="senha-atual"
           v-model="senhaAtual"
           placeholder="Digite a senha atual"
           required
          />

          <button
            type="button"
            class="olho"
            :aria-label="mostrar.atual ? 'Ocultar senha' : 'Mostrar senha'"
            @click="alternar('atual')"
          >
          <svg v-if="!mostrar.atual" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M1 1l22 22" />
            </svg>
          </button>
        </div>

        <!-- NOVA SENHA -->
        <label for="nova-senha">Nova senha</label>
        <div class="campo-senha">
          <input
            :type="mostrar.nova ? 'text' : 'password'"
            id="nova-senha"
            v-model="novaSenha"
            placeholder="Digite a nova senha"
            required
          />
          <button
            type="button"
            class="olho"
            :aria-label="mostrar.nova ? 'Ocultar senha' : 'Mostrar senha'"
            @click="alternar('nova')"
          >
            <svg v-if="!mostrar.nova" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M1 1l22 22" />
            </svg>
          </button>
        </div>

        <! -- CONFIRMAR NOVA SENHA -- >
        <label for="confirmar-senha">Confirme nova senha</label>
        <div class="campo-senha">
          <input 
            :type="mostrar.confirma ? 'text' : 'password'"
            id="confirmar-senha"
            v-model="confirmaSenha"
            placeholder="Digite novamente a nova senha"
            required
          />
          <button
            type="button"
            class="olho"
            :aria-label="mostrar.confirma ? 'Ocultar senha' : 'Mostrar senha'"
            @click="alternar('confirma')"
          >
          <svg v-if="!mostrar.confirma" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M1 1l22 22" />
            </svg>
          </button>
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" class="botao-principal" @mousemove="moverBolha">
          Criar nova senha
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>