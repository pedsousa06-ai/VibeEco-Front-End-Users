<script setup>
// Ícones usados só nas telas de desafios (evita depender de nomes que não existem no Icone.vue)
defineProps({
  nome: { type: String, required: true }, // estrela | moeda | relogio | usuarios | usuario | voltar | check
  tamanho: { type: Number, default: 16 },
})
</script>

<template>
  <svg
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-if="nome === 'estrela'"
      fill="currentColor"
      stroke="none"
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
    />
    <template v-else-if="nome === 'moeda'">
      <circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18" />
      <path d="M12 7v10M9.5 9.5h3.75a1.75 1.75 0 010 3.5H10.5a1.75 1.75 0 000 3.5h4" stroke-width="1.8" />
    </template>
    <template v-else-if="nome === 'relogio'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="nome === 'usuarios'">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0113 0" />
      <path d="M16 4.7a3.5 3.5 0 010 6.6M18 14.2A6.5 6.5 0 0121.5 20" />
    </template>
    <template v-else-if="nome === 'usuario'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0115 0" />
    </template>
    <path v-else-if="nome === 'voltar'" d="M19 12H5M11 6l-6 6 6 6" />
    <path v-else-if="nome === 'check'" class="traco-check" d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3" />
  </svg>
</template>
