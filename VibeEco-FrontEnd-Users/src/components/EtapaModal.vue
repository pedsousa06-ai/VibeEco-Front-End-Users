<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import Icone from '@/components/Icone.vue'

// Tela de execução de uma etapa da missão. O comportamento muda conforme etapa.tipo:
//   'confirmar' -> botão para marcar como concluída
//   'foto'      -> envio de uma foto por vez, até completar a quantidade pedida
//   'quiz'      -> perguntas de múltipla escolha (precisa acertar pelo menos 2/3)
const props = defineProps({
  aberto: Boolean,
  etapa: Object,
  missao: Object,
})
const emit = defineEmits(['fechar', 'concluir', 'foto'])

const idTitulo = useId()
const caixa = ref(null)

const foto = ref(null) // { url, nome, arquivo }
const erro = ref('')
const respostas = ref([])
const tentativaQuiz = ref(null) // { acertos, minimo } quando errou

const perguntas = computed(() => props.etapa?.perguntas ?? [])
const quizCompleto = computed(
  () => perguntas.value.length > 0 && respostas.value.every((r) => r !== null)
)
const restantes = computed(() =>
  props.etapa?.tipo === 'foto' ? props.etapa.fotosNecessarias - props.etapa.fotosEnviadas : 0
)
const percentualFotos = computed(() =>
  props.etapa?.tipo === 'foto'
    ? Math.round((props.etapa.fotosEnviadas / props.etapa.fotosNecessarias) * 100)
    : 0
)

function limparFoto() {
  if (foto.value) URL.revokeObjectURL(foto.value.url)
  foto.value = null
}

// A cada abertura (ou troca de etapa) volta ao estado inicial e leva o foco para dentro
watch(
  () => [props.aberto, props.etapa?.id],
  async ([aberto]) => {
    limparFoto()
    erro.value = ''
    tentativaQuiz.value = null
    respostas.value = Array(perguntas.value.length).fill(null)
    if (!aberto) return
    await nextTick()
    caixa.value?.querySelector('input, button.acao')?.focus()
  },
  { immediate: true }
)
onBeforeUnmount(limparFoto)

function escolherFoto(e) {
  const arquivo = e.target.files?.[0]
  e.target.value = ''
  if (!arquivo) return
  if (!arquivo.type.startsWith('image/')) {
    erro.value = 'Envie um arquivo de imagem (PNG, JPG ou WebP).'
    return
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    erro.value = 'A imagem deve ter no máximo 5 MB.'
    return
  }
  erro.value = ''
  limparFoto()
  foto.value = { url: URL.createObjectURL(arquivo), nome: arquivo.name, arquivo }
}

function enviarFoto() {
  if (!foto.value) return
  // TODO: enviar foto.value.arquivo para a API (FormData)
  emit('foto', foto.value.arquivo)
  limparFoto()
}

function enviarQuiz() {
  const total = perguntas.value.length
  const minimo = Math.ceil((total * 2) / 3)
  const acertos = perguntas.value.filter((p, i) => respostas.value[i] === p.correta).length
  if (acertos >= minimo) {
    emit('concluir')
    return
  }
  tentativaQuiz.value = { acertos, minimo, total }
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

        <!-- FOTO -->
        <template v-if="etapa.tipo === 'foto'">
          <p class="texto">
            Envie uma foto por vez como comprovação. Faltam
            <strong>{{ restantes }}</strong> {{ restantes === 1 ? 'foto' : 'fotos' }} para concluir.
          </p>
          <div
            class="barra"
            role="progressbar"
            aria-label="Fotos enviadas"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="percentualFotos"
          >
            <div class="barra-preenchimento" :style="{ width: percentualFotos + '%' }"></div>
          </div>
          <small class="barra-nota">{{ etapa.fotosEnviadas }} de {{ etapa.fotosNecessarias }} fotos enviadas</small>

          <div v-if="foto" class="previa">
            <img :src="foto.url" alt="Prévia da foto escolhida" />
            <div class="previa-info">
              <strong>{{ foto.nome }}</strong>
              <label class="mini">
                Trocar foto
                <input class="so-leitor" type="file" accept="image/*" @change="escolherFoto" />
              </label>
            </div>
          </div>
          <label v-else class="zona">
            <Icone nome="upload" :tamanho="26" />
            <strong>Clique para escolher a foto</strong>
            <small>PNG, JPG ou WebP, até 5 MB</small>
            <input class="so-leitor" type="file" accept="image/*" @change="escolherFoto" />
          </label>
          <p v-if="erro" class="erro" role="alert">{{ erro }}</p>

          <div class="rodape">
            <button type="button" class="secundario" @click="emit('fechar')">Cancelar</button>
            <button type="button" class="acao" :disabled="!foto" @click="enviarFoto">Enviar foto</button>
          </div>
        </template>

        <!-- QUIZ -->
        <template v-else-if="etapa.tipo === 'quiz'">
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

.barra {
  height: 8px;
  border-radius: 99px;
  background: #d6eadb;
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #15803d, #22c55e);
  transition: width 0.5s ease;
}
.barra-nota {
  display: block;
  margin: 6px 0 16px;
  font-size: 12px;
  color: #64756a;
}

.zona {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 26px 16px;
  border: 2px dashed #b9dcc4;
  border-radius: 12px;
  background: #f6fbf7;
  color: #1b7a34;
  text-align: center;
  cursor: pointer;
}
.zona:hover {
  border-color: #07843f;
  background: #e9f6ed;
}
.zona:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.zona strong {
  font-size: 14px;
  color: #12261a;
}
.zona small {
  font-size: 12px;
  color: #64756a;
}
.previa {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
  border: 1px solid #d5e6da;
  border-radius: 12px;
}
.previa img {
  flex: none;
  width: 110px;
  height: 76px;
  border-radius: 8px;
  object-fit: cover;
}
.previa-info {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.previa-info strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini {
  position: relative;
  width: fit-content;
  padding: 5px 12px;
  border: 1px solid #b9dcc4;
  border-radius: 6px;
  color: #1b7a34;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.mini:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
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
  margin: 12px 0 0;
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
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
@media (prefers-reduced-motion: reduce) {
  .barra-preenchimento {
    transition: none;
  }
}
</style>
