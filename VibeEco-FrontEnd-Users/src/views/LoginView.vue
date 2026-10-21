<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { entrar } from '@/services/auth'

  const router = useRouter()
  const route = useRoute()

  // A tela de carregamento aparece só na primeira vez da sessão,
  // não toda vez que o usuário volta ao login
  const SPLASH_VISTO = 'vibeeco_splash_visto'
  const carregamento = ref(!sessionStorage.getItem(SPLASH_VISTO))

  onMounted(() => {
    if (!carregamento.value) return
    setTimeout(() => {
      carregamento.value = false
      sessionStorage.setItem(SPLASH_VISTO, '1')
    }, 2000);
  })

  const login = ref('')
  const senha = ref('')
  const lembrar = ref(false)
  const erro = ref('')
  const enviando = ref(false)

  // Mensagens que chegam de outras telas do fluxo (?aviso=...)
  const AVISOS = {
    'senha-alterada': 'Senha alterada com sucesso! Entre com a nova senha.',
    'senha-criada': 'Senha criada com sucesso! Agora é só entrar.'
  }
  const aviso = computed(() => AVISOS[route.query.aviso] || '')

  // Só aceita caminhos internos como destino depois do login
  function destinoSeguro() {
    const alvo = route.query.redirect
    return typeof alvo === 'string' && alvo.startsWith('/') && !alvo.startsWith('//')
      ? alvo
      : { name: 'inicio' }
  }

  async function entrarNaPlataforma() {
    erro.value = ''
    if (!login.value.trim() || !senha.value) {
      erro.value = 'Informe seu e-mail ou matrícula e a senha.'
      return
    }
    enviando.value = true
    try {
      // TODO: trocar pela chamada real de autenticação em services/auth.js
      await entrar(login.value, senha.value, lembrar.value)
      router.push(destinoSeguro())
    } catch (e) {
      erro.value = e.message || 'Não foi possível entrar. Tente novamente.'
    } finally {
      enviando.value = false
    }
  }

</script>

<template>

  <div v-if="carregamento" class="loading">
    <img src="/logo-principal.png" alt="VibeEco">
  </div>

  <div v-else class="home">
    <div class="lado-esquerdo">
      <img src="/fundo-cortado.png" alt="Fundo VibeEco">  

      <div class="caixa-lado-esquerdo">
        <img src="/logo-principal.png" alt="Logo">
        <h1>Sustentabilidade que <span class="texto-destaque">engaja e transforma</span></h1>
        <p>Complete missões, acumule XP, conquiste <br>
         recompensas e faça parte de uma comunidade<br>
          comprometida com o futuro do planeta.</p>
      </div>
    </div>
    <div class="lado-direito">
      <div class="caixa-login">
        <h2>Bem-vindo ao VibeEco</h2>
        <p class="subtitulo">
          Entre com suas credenciais para acessar a plataforma.
        </p>

        <form @submit.prevent="entrarNaPlataforma" novalidate>
          <p v-if="aviso" class="mensagem mensagem-ok" role="status">{{ aviso }}</p>

          <label for="email">E-mail ou matrícula</label>
          <input
            type="text"
            id="email"
            v-model="login"
            autocomplete="username"
            placeholder="seuemail@instituicao.edu.br"
          />

          <label for="senha">Senha</label>
          <input
            type="password"
            id="senha"
            v-model="senha"
            autocomplete="current-password"
            placeholder="Digite sua senha"
          />
          
          <div class="opcoes-login">
            <label class="lembrar">
              <input type="checkbox" v-model="lembrar"/>
              lembrar de mim
            </label>

            <RouterLink to="/esqueci-senha">Esqueci minha senha</RouterLink>
          </div>

          <p v-if="erro" class="mensagem mensagem-erro" role="alert">{{ erro }}</p>

          <button type="submit" :disabled="enviando">
            {{ enviando ? 'Entrando...' : 'Entrar na plataforma' }}
          </button>
        </form>

        <p class="cadastro">
          Primeiro acesso?
          <RouterLink to="/primeiro-acesso">Crie sua senha aqui</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* CONFIGURAÇÕES DA TELA */
/* O overflow hidden fica só nos contêineres desta tela (.loading e .home),
   para não travar a rolagem das outras páginas do site */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* TELA DE CARREGAMENTO */

.loading {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(135deg, #1d4d32, #39865b);
}

.loading img{
  width: 150px;
}

.home{
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

/* ESTILIZAÇÃO DO LADO ESQUERDO DA TELA */
.lado-esquerdo{
  width: 50%;
  height: 100%;
  position: relative;
}

.lado-esquerdo > img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.caixa-lado-esquerdo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  height: 60%;
  z-index: 2;
  
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.caixa-lado-esquerdo img {
  width: 300;
  height: auto;
}

.caixa-lado-esquerdo h1 {
  color: white;
  text-align: left;
  margin: 0 0 0;
  font-size: 250%;
}

.caixa-lado-esquerdo p {
  color: rgba(255, 255, 255, 0.514);
  text-align: left;
  margin: 8px 0 0;
  line-height: 1.4;
  font-size: 150%;
}
.texto-destaque{
  color: rgba(34, 197, 94, 1);
}

/* ESTILIZAÇÕA DO LADO DIREITO DA TELA */

.lado-direito{
  width: 50%;
  height: 100%;
  background-color: #f4f8f4;

  display: flex;
  justify-content: center;
  align-items: center;
}

.caixa-login {
  width: 60%;
  max-width: 400px;
}

.caixa-login h2{
  color: #203b27;
  text-align: center;
  font-size: 28px;
  margin: 0;
}

.subtitulo{
  color: #829084;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 35px;
}

.caixa-login form{
  display: flex;
  flex-direction: column;
}

.caixa-login form > label{
  color: #344638;
  font-size: 13px;
  margin-bottom: 7px;
}

.caixa-login form > input{
  height: 42px;
  border: 1px solid #dce6dc;
  border-radius: 8px;
  padding: 0 12px;
  margin-bottom: 20px;
  background-color: white;
  outline-color: #22c55e;
}

.opcoes-login{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  margin-bottom: 22px;
}

.lembrar{
  display: flex;
  align-items: center;
  gap: 5px;
  color: #68785b;
}

.opcoes-login a,
.cadastro a{
  color: #16b957;
  text-decoration: none;
}

.caixa-login button{
  height: 44px;
  border: none;
  border-radius: 8px;
  background-color: #20c765;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.caixa-login button:hover:not(:disabled){
  background-color: #19ad55;
}

.caixa-login button:disabled{
  opacity: 0.7;
  cursor: wait;
}

.cadastro{
  color: #829084;
  text-align: center;
  font-size: 12px;
  margin-top: 25px;
}

/* MENSAGENS DE AVISO E ERRO */
.mensagem{
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.mensagem-ok{
  background-color: #e3f4e8;
  color: #1b7a34;
}

.mensagem-erro{
  margin: 0 0 14px;
  background-color: #fdecec;
  color: #c62828;
}

</style>
