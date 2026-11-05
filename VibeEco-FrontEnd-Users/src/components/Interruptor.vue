<script setup>
// Botão liga/desliga acessível. Uso: <Interruptor v-model="valor" rotulo-id="id-do-texto" />

defineProps({
    modelValue: { type: Boolean, default: false},
    rotuloId: { type: String, default: ''}
})
defineEmits(['update:modelValue'])
</script>

<template>
    <button
    type="button"
    role="switch"
    class="interruptor"
    :class="{ ligado: modelValue}"
    :aria-checked="modelValue"
    :aria-labelledby="rotuloId || undefined"
    @click="$emit('update:modelValue', !modelValue)"
    >

    <span class="bola"/>
    </button>
</template>

<style scoped>
.interruptor {
  position: relative;
  flex: none;
  width: 44px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 99px;
  background: #d3e3d7;
  cursor: pointer;
  transition: background 0.15s;
}
.interruptor.ligado {
  background: var(--verde-900, #0a4a26);
}
.bola {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s;
}
.ligado .bola {
  transform: translateX(20px);
}
.interruptor:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
</style>