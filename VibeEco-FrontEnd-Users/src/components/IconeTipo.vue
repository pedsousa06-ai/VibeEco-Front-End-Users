<script setup>
import Icone from '@/components/Icone.vue'
import { TIPOS } from '@/services/tipos'

// Quadradinho colorido com o ícone do tipo (missão, desafio, conquista...)
// Uso: <IconeTipo tipo="missao" :tamanho="44" />
defineProps({
  tipo: { type: String, required: true },
  tamanho: { type: Number, default: 44 },
})
</script>

<template>
  <span
    class="icone-tipo"
    :style="{
      width: tamanho + 'px',
      height: tamanho + 'px',
      background: TIPOS[tipo].fundo,
      color: TIPOS[tipo].texto,
    }"
    aria-hidden="true"
  >
    <Icone :nome="TIPOS[tipo].icone" :tamanho="Math.round(tamanho * 0.48)" />
  </span>
</template>

<style scoped>
.icone-tipo {
  display: grid;
  place-items: center;
  flex: none;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 12px;
}
</style>
