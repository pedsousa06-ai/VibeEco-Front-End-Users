<script setup>
import { ref } from 'vue'

const email = ref('')

function enviarLink() {
  // aqui depois você chama a API de recuperação de senha
  console.log('Enviar link para:', email.value)
}

function moverBolha(event) {
  const botao = event.currentTarget
  const area = botao.getBoundingClientRect()

  botao.style.setProperty('--x', `${event.clientX - area.left}px`)
  botao.style.setProperty('--y', `${event.clientY - area.top}px`)
}
</script>

<template>
  <div class="pagina-esqueci-senha">
    <img class="logo" src="/logo-principal.png" alt="VibeEco">

    <div class="caixa-esqueci-senha">
      <RouterLink to="/" class="voltar">&larr; Voltar ao login</RouterLink>

      <h2>Esqueceu sua senha?</h2>
      <p class="subtitulo">
        Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
      </p>

      <form @submit.prevent="enviarLink">
        <label for="email">E-mail institucional</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="seuemail@instituicao.edu.br"
          required
        />

        <button type="submit" @mousemove="moverBolha">
          Enviar link de recuperação
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.pagina-esqueci-senha {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;

  background: url('/fundo.png') center / cover no-repeat;
}

.logo {
  width: 350px;
  height: auto;
}

.caixa-esqueci-senha {
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
  padding: 28px 28px 32px;

  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}

.voltar {
  display: inline-block;
  margin-bottom: 18px;
  color: #829084;
  font-size: 12px;
  text-decoration: none;
}

.voltar:hover {
  color: #16b957;
}

.caixa-esqueci-senha h2 {
  margin: 0;
  color: #203b27;
  font-size: 22px;
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.subtitulo {
  margin: 8px 0 24px;
  color: #829084;
  font-size: 12px;
  line-height: 1.4;
}

.caixa-esqueci-senha form {
  display: flex;
  flex-direction: column;
}

.caixa-esqueci-senha label {
  margin-bottom: 7px;
  color: #344638;
  font-size: 12px;
  font-weight: bold;
}

.caixa-esqueci-senha input {
  height: 42px;
  padding: 0 12px;
  margin-bottom: 20px;

  border: 1px solid #dce6dc;
  border-radius: 8px;
  background-color: white;
  outline-color: #22c55e;
  font-size: 13px;
}

/* BOTÃO COM EFEITO DE BOLHA QUE SEGUE O MOUSE */
.caixa-esqueci-senha button {
  --x: 50%;
  --y: 50%;

  position: relative;
  overflow: hidden;

  height: 44px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1d9e4f, #22c55e);
  color: rgb(255, 255, 255);
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
}

.caixa-esqueci-senha button::before {
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

.caixa-esqueci-senha button:hover::before {
  opacity: 1;
}
</style>