<script setup>
import { ref, useId } from 'vue'

defineProps({
  rotulo: String,
  placeholder: String,
  autocomplete: { type: String, default: 'new-password' },
  desabilitado: Boolean,
})

const modelo = defineModel({ type: String, default: '' })
const visivel = ref(false)
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="auth-rotulo">{{ rotulo }}</label>

    <div class="entrada">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>

      <input
        :id="id"
        v-model="modelo"
        :type="visivel ? 'text' : 'password'"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="desabilitado"
      />

      <button
        type="button"
        class="olho"
        :aria-label="visivel ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visivel"
        @click="visivel = !visivel"
      >
        <svg v-if="visivel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
          <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
          <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
          <path d="m2 2 20 20" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.entrada {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 14px 0 16px;
  box-sizing: border-box;
  border: 1px solid #cde5d3;
  border-radius: 10px;
  background: #fff;
  color: #6f7f75;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.entrada:focus-within {
  border-color: #1b8a4b;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}
.entrada > svg {
  flex: none;
  width: 18px;
  height: 18px;
}
.entrada input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14.5px;
  color: #12261a;
}
.entrada input::placeholder {
  color: #8a9a90;
}
.entrada input:disabled {
  cursor: not-allowed;
}

.olho {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: #6f7f75;
  cursor: pointer;
}
.olho svg {
  width: 18px;
  height: 18px;
}
.olho:hover {
  color: #1b8a4b;
}
.olho:focus-visible {
  outline: 2px solid #1b8a4b;
  outline-offset: 1px;
}
</style>
