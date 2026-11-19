<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  titulo: {
    type: String,
    default: 'Abandonar desafio?',
  },
  mensagem: {
    type: String,
    default: 'Tem certeza que deseja abandonar este desafio? Seu progresso nele poderá ser perdido.',
  },
})

const emit = defineEmits(['confirmar', 'cancelar'])

// Fecha o modal ao apertar a tecla Esc
function aoPressionarTecla(event) {
  if (event.key === 'Escape') {
    emit('cancelar')
  }
}

onMounted(() => {
  window.addEventListener('keydown', aoPressionarTecla)
  // Bloqueia o scroll da página ao fundo enquanto o modal está aberto
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', aoPressionarTecla)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('cancelar')">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
        
        <div class="icone-container">
          <!-- Ícone de Sair/LogOut do Lucide em SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>

        <h2 id="titulo-modal" class="titulo">{{ titulo }}</h2>
        <p class="mensagem">{{ mensagem }}</p>

        <div class="botoes">
          <button type="button" class="botao botao-cancelar" @click="emit('cancelar')">
            Cancelar
          </button>
          <button type="button" class="botao botao-confirmar" @click="emit('confirmar')">
            Abandonar
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(18, 38, 26, 0.4);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  padding: 28px 24px 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.icone-container {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #FDECEC;
}

.titulo {
  margin: 0 0 8px;
  color: #12261A;
  font-size: 20px;
  font-weight: 800;
  font-family: 'Inter', system-ui, sans-serif;
}

.mensagem {
  margin: 0 0 20px;
  color: #3D4F44;
  font-size: 14px;
  line-height: 1.5;
  font-family: 'Inter', system-ui, sans-serif;
}

.botoes {
  display: flex;
  gap: 12px;
}

.botao {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 13px;
  border: 0;
  border-radius: 12px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
}

.botao:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.botao:active {
  transform: scale(0.98);
}

.botao-cancelar {
  background: #EEF6F0;
  color: #1F5D37;
}

.botao-confirmar {
  background: #C0392B;
  color: #FFFFFF;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>