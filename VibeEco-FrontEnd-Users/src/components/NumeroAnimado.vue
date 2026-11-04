<script setup>
// Número que "sobe" de 0 até o valor (e anima de novo quando o valor muda).
// Usa useTransition, da biblioteca @vueuse/core.
import { onMounted, ref, watch } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'

const props = defineProps({
  valor: { type: Number, required: true },
  duracao: { type: Number, default: 900 },
})

// Quem pede menos movimento no sistema vê o número final direto
const reduzirMovimento =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const origem = ref(reduzirMovimento ? props.valor : 0)
const animado = useTransition(origem, {
  duration: reduzirMovimento ? 0 : props.duracao,
  transition: TransitionPresets.easeOutCubic,
})

onMounted(() => {
  origem.value = props.valor
})
watch(
  () => props.valor,
  (novo) => (origem.value = novo)
)
</script>

<template>{{ Math.round(animado).toLocaleString('pt-BR') }}</template>
