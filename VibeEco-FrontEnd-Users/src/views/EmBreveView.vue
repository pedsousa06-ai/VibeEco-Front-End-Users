
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="em-breve">
    <h2>{{ route.meta.titulo }}</h2>
    <p>Esta tela ainda está em construção.</p>
    <RouterLink to="/inicio" class="voltar">Voltar ao início</RouterLink>
  </section>
</template>

<style scoped>
.em-breve {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 72px 24px;
  border: 1px dashed var(--borda, #e0eae2);
  border-radius: 16px;
  background: #fff;
  text-align: center;
}
h2 {
  margin: 0;
  font-size: 22px;
  color: var(--texto, #12261a);
}
p {
  margin: 0;
  color: var(--texto-suave, #64756a);
}
.voltar {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 10px;
  background: #16a34a;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}
.voltar:hover {
  background: #12873d;
}
.voltar:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
</style>
