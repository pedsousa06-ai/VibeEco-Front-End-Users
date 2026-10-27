<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import Icone from '@/components/Icone.vue'

// Tela de execução de uma etapa da missão. O comportamento muda conforme etapa.tipo:
//   'confirmar' -> botão para marcar a etapa como concluída
//   'quiz'      -> perguntas de múltipla escolha (precisa acertar pelo menos 2/3)
const props = defineProps({
  aberto: Boolean,
  etapa: Object,
  missao: Object,
})
const emit = defineEmits(['fechar', 'concluir'])

const idTitulo = useId()
const caixa = ref(null)

const respostas = ref([])
const tentativaQuiz = ref(null) // { acertos, total } quando errou

const perguntas = computed(() => props.etapa?.perguntas ?? [])
const quizCompleto = computed(
  () => perguntas.value.length > 0 && respostas.value.every((r) => r !== null)
)

// A cada abertura (ou troca de etapa) volta ao estado inicial e leva o foco para dentro
watch(
  () => [props.aberto, props.etapa?.id],
  async ([aberto]) => {
    tentativaQuiz.value = null
    respostas.value = Array(perguntas.value.length).fill(null)
    if (!aberto) return
    await nextTick()
    caixa.value?.querySelector('input, button.acao')?.focus()
  },
  { immediate: true }
)

function enviarQuiz() {
  const total = perguntas.value.length
  const minimo = Math.ceil((total * 2) / 3)
  const acertos = perguntas.value.filter((p, i) => respostas.value[i] === p.correta).length
  if (acertos >= minimo) {
    emit('concluir')
    return
  }
  tentativaQuiz.value = { acertos, total }
  respostas.value = Array(total).fill(null)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="aberto && etapa" class="fundo" @mousedown.self="emit('fechar')" @keydown.esc="emit('fechar')">
      <div ref="caixa" class="modal" role="dialog" aria-modal="true" :aria-labelledby="idTitulo">
        <button type="button" class="fechar" aria-label="Fechar" @click="emit('fechar')">
          <Icone nome="fechar" :tamanho="18" />
        </button>

        <small class="origem">{{ missao?.titulo }} · Etapa {{ etapa.id }} de {{ missao?.etapas.length }}</small>
        <h2 :id="idTitulo">{{ etapa.titulo }}</h2>
        <p class="recompensa">
          <Icone nome="estrela" :tamanho="14" preenchido />+{{ etapa.xp }} XP ao concluir
        </p>

        <!-- QUIZ -->
        <template v-if="etapa.tipo === 'quiz'">
          <p class="texto">Responda todas as perguntas. É preciso acertar pelo menos 2 de 3 para concluir.</p>
          <p v-if="tentativaQuiz" class="erro" role="alert">
            Você acertou {{ tentativaQuiz.acertos }} de {{ tentativaQuiz.total }}. Tente de novo!
          </p>

          <fieldset v-for="(pergunta, i) in perguntas" :key="i" class="pergunta">
            <legend>{{ i + 1 }}. {{ pergunta.texto }}</legend>
            <label
              v-for="(opcao, j) in pergunta.opcoes"
              :key="j"
              class="opcao"
              :class="{ 'opcao-marcada': respostas[i] === j }"
            >
              <input v-model="respostas[i]" type="radio" :name="`pergunta-${i}`" :value="j" />
              {{ opcao }}
            </label>
          </fieldset>

          <div class="rodape">
            <button type="button" class="secundario" @click="emit('fechar')">Cancelar</button>
            <button type="button" class="acao" :disabled="!quizCompleto" @click="enviarQuiz">
              Enviar respostas
            </button>
          </div>
        </template>

        <!-- CONFIRMAR -->
        <template v-else>
          <p class="texto">
            Realize esta etapa e, quando terminar, marque como concluída para receber o seu XP.
          </p>
          <div class="rodape">
            <button type="button" class="secundario" @click="emit('fechar')">Agora não</button>
            <button type="button" class="acao" @click="emit('concluir')">Marcar como concluída</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Cores fixas: o modal fica fora do layout (Teleport), então não herda as variáveis dele */
.fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(6, 30, 16, 0.5);
  font-family: 'Inter', system-ui, sans-serif;
}
.modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 32px);
  padding: 28px 28px 24px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 20px;
  background: #fff;
  color: #12261a;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.fechar {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: #f0f4f1;
  color: #4b5f52;
  cursor: pointer;
}
.fechar:hover {
  background: #e2ebe4;
}
.origem {
  display: block;
  margin-right: 40px;
  font-size: 12px;
  color: #64756a;
}
h2 {
  margin: 6px 40px 8px 0;
  font-size: 22px;
  font-weight: 700;
}
.recompensa {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 14px;
  padding: 4px 10px;
  border-radius: 99px;
  background: #fff7de;
  color: #8a5a00;
  font-size: 12.5px;
  font-weight: 700;
}
.recompensa svg {
  color: #f5b301;
}
.texto {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5f52;
}

.pergunta {
  margin: 0 0 14px;
  padding: 0;
  border: 0;
}
.pergunta legend {
  margin-bottom: 8px;
  padding: 0;
  font-size: 14.5px;
  font-weight: 600;
}
.opcao {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  padding: 10px 12px;
  border: 1.5px solid #e0eae2;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.opcao:hover {
  background: #f6fbf7;
}
.opcao-marcada {
  border-color: #22c55e;
  background: #ecfaf1;
}
.opcao input {
  accent-color: #16a34a;
}
.opcao:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 1px;
}

.erro {
  margin: 0 0 12px;
  font-size: 13px;
  color: #c62828;
}
.rodape {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.secundario,
.acao {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.secundario {
  border: 1px solid #d5e6da;
  background: #fff;
  color: #12261a;
}
.secundario:hover {
  background: #f1faf3;
}
.acao {
  border: 0;
  background: linear-gradient(90deg, #15803d, #22c55e);
  color: #fff;
}
.acao:hover:not(:disabled) {
  filter: brightness(0.94);
}
.acao:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.secundario:focus-visible,
.acao:focus-visible,
.fechar:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
</style>
