<script setup>
  import { ref, onMounted} from 'vue'

  const carregamento = ref(true)

  onMounted(() => {
    setTimeout(() => {
      carregamento.value = false
    }, 2000);
  })
</script>

<template>
  <div v-if="carregamento" class="loading">
    <img src="/logo-principal.png" alt="VibeEco">
  </div>

  <div v-else class="home">
    <div class="lado-esquerdo">
      <img src="/fundo-cortado.png" alt="Fundo VibeEco">  


      <h1>Sustentabilidade que engaja e transforma</h1>
      <p>Complete missões, acumule XP, conquiste
         recompensas e faça parte de uma comunidade
          comprometida com o futuro do planeta.</p>
    </div>
  </div>
</template>

<style scoped>

:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

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

.lado-esquerdo{
  width: 50%;
  height: 100%;
  position: relative;
}

.lado-esquerdo img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lado-esquerdo h1 {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color:white ;
  font-size: 40px;
  width: 80%;
}

.lado-esquerdo p {
  position: absolute;
  top: 45%;
  transform: translate( 10%, 50%);
  color:white ;
 
}

</style>
