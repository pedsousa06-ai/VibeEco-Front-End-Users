<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
    aberto: Boolean,
    titulo: String,
    texto: String,
    rotuloConfirmar: { type: String, default: 'Confirmar' },
    carregando: Boolean,
    erro: String,
})

const emit = defineEmits(['confirmar', 'cancelar'])

const botaoCancelar = ref(null)

// ao abrir, o foco vai para "Cancelar", a opção mais segura
watch(
    () => props.aberto,
    async (aberto) => {
        if (!aberto) return
        await nextTick()
        botaoCancelar.value?.focus()
    }
)

function fechar() {
    if(!props.carregando) emit('cancelar')
}
</script>

<template>
    <Teleport to="body">
        <div v-if="aberto" class="fundo" @click.self="fechar" @keydown.esc="fechar">
            <div class="caixa" role="dialog" aria-modal="true" aria-labelledby="confirmar-titulo">
                <h3 id="confirmar-titulo">{{ titulo }}</h3>
                <p>{{ texto }}</p>
                <p v-if="erro" class="erro" role="alert">{{ erro }}</p>

                <div class="acoes">
                    <button ref="botaoCancelar" type="button" class="btn btn-secundario" :disabled="carregando" @click="fechar">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-principal" :disabled="carregando" @click="emit('confirmar')">
                        {{ carregando ? 'Aguarde...' : rotuloConfirmar }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(18, 38, 26, 0.45);
}
.caixa {
  width: 100%;
  max-width: 380px;
  padding: 24px;
  border-radius: 16px;
  background: var(--superficie, #fff);
  box-shadow: 0 20px 50px -20px rgba(18, 38, 26, 0.5);
}
.caixa h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}
.caixa p {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--texto-suave);
}
.caixa .erro {
  margin: -8px 0 16px;
  color: #c62828;
  font-weight: 600;
}
.acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.btn-secundario {
  background: #eaf0eb;
  color: var(--texto);
}
.btn-principal {
  background: #22c55e;
  color: #fff;
}
</style>