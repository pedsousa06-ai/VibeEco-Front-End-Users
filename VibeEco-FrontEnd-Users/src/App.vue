<script setup>
  import { ref, onMounted} from 'vue'
  import EsqueciSenha from './EsqueciSenha.vue';


  const carregamento = ref(true)
  const mostrarEsqueciSenha = ref(false)

  onMounted(() => {
    setTimeout(() => {
      carregamento.value = false
    }, 2000);
  })

</script>

<template>
  <EsqueciSenha v-if="mostrarEsqueciSenha"/>

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

        <form>
          <label for="email">E-mail ou matrícula</label>
          <input type="text" id="email" placeholder="seuemail@instituicao.edu.br"/>

          <label for="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite sua senha"/>
          
          <div class="opcoes-login">
            <label class="lembrar">
              <input type="checkbox"/>
              lembrar de mim
            </label>

            <a href="#" @click.prevent="mostrarEsqueciSenha = true">
              Esqueci minha senha
            </a>
          </div>

          <button type="button">
            Entrar na plataforma
          </button>
        </form>

        <p class="cadastro">
          Primeiro acesso?
          <a href="#" @click.prevent>Crie sua senha aqui</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* CONFIGURAÇÕES DA TELA */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* TELA DE CARREGAMENTO */

.loading {
  width: 100%;
  height: 100vh;

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

.caixa-login button:hover{
  background-color: #19ad55;
}

.cadastro{
  color: #829084;
  text-align: center;
  font-size: 12px;
  margin-top: 25px;
}

</style>
