<script setup>
// Moldura das telas de recuperação de senha: logo + cartão branco sobre o fundo de folhas.
// O conteúdo do cartão entra pelo <slot />.
</script>

<template>
  <main class="auth-tela">
    <img class="auth-logo" src="/logo-principal.png" alt="VibeEco" />
    <div class="auth-cartao">
      <slot />
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* position fixed + scroll próprio: o cartão continua acessível em telas baixas */
.auth-tela {
  position: fixed;
  inset: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 34px;
  padding: 32px 16px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #0b2a16;
  background-image:
    linear-gradient(rgba(0, 25, 10, 0.45), rgba(0, 25, 10, 0.45)),
    url('/fundo-cortado.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* margin auto centraliza o conjunto sem cortar o topo em telas baixas */
.auth-logo {
  display: block;
  width: 400px;
  max-width: 80vw;
  height: auto;
  margin-top: auto;
}
.auth-cartao {
  width: 100%;
  max-width: 570px;
  margin-bottom: auto;
  box-sizing: border-box;
  padding: 96px 62px 64px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

@media (max-width: 600px) {
  .auth-logo {
    width: 240px;
  }
  .auth-cartao {
    padding: 32px 20px 36px;
  }
}
</style>

<!-- Estilos compartilhados das telas de recuperação (prefixo auth- evita conflito) -->
<style>
.auth-voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #5b7a66;
  text-decoration: none;
}
.auth-voltar svg {
  width: 16px;
  height: 16px;
}
.auth-voltar:hover {
  text-decoration: underline;
}
.auth-voltar:focus-visible {
  outline: 2px solid #1b8a4b;
  outline-offset: 3px;
  border-radius: 2px;
}

.auth-titulo {
  margin: 22px 0 0;
  font-size: 29px;
  line-height: 1.2;
  font-weight: 700;
  color: #12261a;
}
.auth-descricao {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: #6f7f75;
}
.auth-form {
  margin-top: 40px;
}
.auth-rotulo {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #12261a;
}

.auth-botao {
  display: block;
  width: 100%;
  height: 48px;
  margin-top: 20px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #1a8f4e, #22c55e);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s;
}
.auth-botao:hover:not(:disabled) {
  filter: brightness(0.93);
}
.auth-botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.auth-botao:disabled {
  opacity: 0.7;
  cursor: wait;
}

.auth-erro,
.auth-ok {
  margin: 12px 0 0;
  font-size: 13px;
}
.auth-erro {
  color: #c62828;
}
.auth-ok {
  color: #1b7a34;
}

@media (max-width: 600px) {
  .auth-titulo {
    font-size: 24px;
  }
}
</style>
