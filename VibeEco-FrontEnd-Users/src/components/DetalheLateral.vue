<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Icone from '@/components/Icone.vue'
import IconeTipo from '@/components/IconeTipo.vue'
import { TIPOS } from '@/services/tipos'

// Painel que desliza da direita com os detalhes de um item.
// O conteúdo vai no slot padrão e os botões de ação no slot "acoes".
//
// <DetalheLateral :aberto="aberto" tipo="missao" titulo="..." quando="..." @fechar="aberto = false">
//   ...conteúdo...
//   <template #acoes>...botões...</template>
// </DetalheLateral>
const props = defineProps({
  aberto: Boolean,
  tipo: String,
  rotulo: String, // opcional: troca o rótulo padrão do tipo (ex.: "Missão concluída")
  titulo: String,
  quando: String,
})
const emit = defineEmits(['fechar'])

const painel = ref(null)
let gatilho = null

watch(
  () => props.aberto,
  async (aberto) => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    if (aberto) {
      gatilho = document.activeElement
      await nextTick()
      painel.value?.querySelector('[data-foco]')?.focus()
    } else {
      gatilho?.focus?.()
      gatilho = null
    }
  }
)

// Esc fecha e Tab fica preso dentro do painel
function aoTeclar(evento) {
  if (evento.key === 'Escape') {
    evento.stopPropagation()
    emit('fechar')
    return
  }
  if (evento.key !== 'Tab') return
  const focaveis = painel.value?.querySelectorAll('button:not([disabled]), a[href]')
  if (!focaveis?.length) return
  const primeiro = focaveis[0]
  const ultimo = focaveis[focaveis.length - 1]
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault()
    primeiro.focus()
  }
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="gaveta">
      <div v-if="aberto" class="fundo" @click.self="emit('fechar')">
        <aside ref="painel" class="painel" role="dialog" aria-modal="true" :aria-label="titulo" @keydown="aoTeclar">
          <header class="topo">
            <span>Detalhes</span>
            <button type="button" class="fechar" data-foco aria-label="Fechar detalhes" @click="emit('fechar')">
              <Icone nome="fechar" :tamanho="18" />
            </button>
          </header>

          <div class="conteudo">
            <div v-if="tipo" class="hero">
              <IconeTipo :tipo="tipo" :tamanho="56" />
              <span class="hero-rotulo" :style="{ color: TIPOS[tipo].texto }">{{ rotulo || TIPOS[tipo].rotulo }}</span>
              <h2>{{ titulo }}</h2>
              <small v-if="quando">{{ quando }}</small>
            </div>

            <slot />
          </div>

          <footer v-if="$slots.acoes" class="rodape">
            <slot name="acoes" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  background: rgba(10, 30, 18, 0.45);
  backdrop-filter: blur(2px);
}
.painel {
  display: flex;
  flex-direction: column;
  width: min(440px, 100%);
  height: 100%;
  background: #fff;
  box-shadow: -20px 0 50px -20px rgba(0, 0, 0, 0.4);
}
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--borda);
  font-size: 14px;
  font-weight: 700;
  color: var(--texto-suave);
}
.fechar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.fechar:hover {
  background: var(--verde-100);
}
.fechar:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}
.conteudo {
  flex: 1;
  display: grid;
  align-content: start;
  gap: 20px;
  padding: 24px 20px;
  overflow-y: auto;
}
.hero {
  display: grid;
  justify-items: start;
  gap: 6px;
}
.hero-rotulo {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
}
.hero h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}
.hero small {
  color: var(--texto-suave);
  font-size: 13px;
}
.rodape {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--borda);
}

/* animação: fundo some/aparece e o painel desliza */
.gaveta-enter-active,
.gaveta-leave-active {
  transition: opacity 0.2s;
}
.gaveta-enter-active .painel,
.gaveta-leave-active .painel {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.gaveta-enter-from,
.gaveta-leave-to {
  opacity: 0;
}
.gaveta-enter-from .painel,
.gaveta-leave-to .painel {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .gaveta-enter-active,
  .gaveta-leave-active,
  .gaveta-enter-active .painel,
  .gaveta-leave-active .painel {
    transition: none;
  }
}
</style>
