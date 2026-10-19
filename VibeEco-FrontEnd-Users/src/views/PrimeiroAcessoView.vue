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

const erro = ref('')

const senhaIguais = computed(() => novaSenha.value === confirmaSenha.value)

function alternar(campo) {
  mostrar.value[campo] = !mostrar.value[campo]
}

function criarSenha(){
  erro.value = ''

  if(novaSenha.value.length < 8){
    erro.value = '⇾ A nova senha deve ter pelo menos 8 caracteres.'
    return
  }

  if(!senhaIguais.value) {
    erro.value = 'As senhas não coincidem'
    return
  }

  // aqui depois você chama a API para trocar a senha
  console.log('Senha alterada com sucesso')
}

function moverBolha(event) {
  const botao = event.currentTarget
  const area = botao.getBoundingClientRect()
 
  botao.style.setProperty('--x', `${event.clientX - area.left}px`)
  botao.style.setProperty('--y', `${event.clientY - area.top}px`)
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
  .pagina-primeiro-acesso {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 28px;
    padding: 24px 0;
    box-sizing: border-box;

    background: url('fundo.png') center / cover no-repeat;
  }

  .logo{
    width: 350px;
    height: auto;
  }

  .caixa-troca-senha{
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    padding: 28px 28px 40px;

    background-color:white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);

  }

  .voltar{
    display: inline-block;
    margin-bottom: 18px;
    color: #829084;
    font-size: 14px;
    text-decoration: none;
  }

  .voltar:hover{
    color: #16b957;
  }

  .caixa-troca-senha h2{
    margin: 0;
    color: #203b27;
    font-size: 22px;
    font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .subtitulo{
    margin: 8px 0 24px;
    color: #829084;
    font-size: 15px;
    line-height: 1.3;
  }

  .caixa-troca-senha form{
    display: flex;
    flex-direction: column;
  }

  .caixa-troca-senha label{
    margin-bottom: 7px;
    color: #344638;
    font-size: 15px;
    font-weight: bold
  }

  /* CAMPO DE SENHA COM OLINHO */
  .campo-senha {
    position: relative;
    margin-bottom: 18px;
  }

  .campo-senha input{
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    padding: 0 40px 0 12px;

    border: 1px solid #dce6dc;
    border-radius: 8px;
    background-color: white;
    outline-color: #22c55e;
    font-size: 13px;
  }

  .olho {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    width: 22px;
    height: 22px;
    padding: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    background: transparent;
    color: #829084;
    cursor: pointer;
  }

  .olho:hover{
    color: #16b957;
  }
  
  .olho svg{
    width: 18px;
    height: 18px;
  }

  .erro{
    margin: 0 0 14px;
    color: #d93025;
    font-size: 15px;
  }

  /* BOTÃO PRINCIPAL COM EFEITO DE BOLHA */
  .botao-principal{
    --x: 50%;
    --y: 50%;

    position: relative;
    overflow: hidden;

    height: 44px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #1d9e4f, #22c55e);
    color: white;
    font-weight: bold;
    font-size: 13px;
    cursor: pointer;
  }

  .botao-principal::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
    circle 90px at var(--x) var(--y),
    rgba(145, 221, 142, 0.822),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  }

  .botao-principal:hover::before{
    opacity: 1;
  }

</style>