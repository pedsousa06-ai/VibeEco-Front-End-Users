<script setup>
// LAYOUT PROVISÓRIO da área logada: só uma barra com a logo e o botão Sair, para o fluxo
// funcionar de ponta a ponta. Será substituído pelo layout do Figma.
import { useRouter } from 'vue-router'
import { sair } from '@/services/auth'

const router = useRouter()

function deslogar() {
  sair()
  router.push({ name: 'tela-acesso' })
}
</script>

<template>
  <div class="app">
    <header class="topo">
      <img class="logo" src="/logo-principal.png" alt="VibeEco" />
      <button type="button" class="sair" @click="deslogar">Sair</button>
    </header>

    <main class="conteudo">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f4f8f4;
  font-family: 'Inter', system-ui, sans-serif;
}
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: linear-gradient(135deg, #1d4d32, #39865b);
}
.logo {
  height: 36px;
  width: auto;
}
.sair {
  height: 36px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: transparent;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.sair:hover {
  background: rgba(255, 255, 255, 0.12);
}
.sair:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.conteudo {
  padding: 24px;
}
</style>
