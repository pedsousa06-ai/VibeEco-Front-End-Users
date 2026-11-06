<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Icone from './Icone.vue';
import { usuario } from '@/services/usuario.js';

defineProps({
    enviando: { type: Boolean, default: false},
    erro: { type: String, default: ''},
    // lista de { id, nome }; sem itens, o botão categoria não aparece
    categorias: { type: Array, default: () => [] }
})

const emit = defineEmits(['fechar', 'publicar'])

const texto = ref('')
const categoria = ref('')
const foto = ref(null)
const entradaFoto = ref(null)
const campoTexto = ref(null)
const erroLocal = ref('')

const previa = computed(() => (foto.value ? URL.createObjectURL(foto.value): ''))
const LIMITE_FOTO = 5 * 1024 * 1024

function escolherFoto(evento) {
    const arquivo = evento.target.files?.[0]
    erroLocal.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
        erroLocal.value = 'Escolha um arquivo de imagem.'
    } else if(arquivo.size > LIMITE_FOTO) {
        erroLocal.value = 'A imagem deve ter no máximo 5 MB'
    } else {
        foto.value = arquivo
    }

    evento.target.value = ''
}

function enviar(){
    if (!texto.value.trim()) {
        erroLocal.value = 'Escreva algo antes de publicar.'
        return
    }
    emit('publicar', { 
        texto: texto.value.trim(),
        categoria: categoria.value,
        foto: foto.value
        })
}

function aoApertarTecla(e) {
    if(e.key === 'Escape') emit('fechar')
}
onMounted(() => {
    window.addEventListener('keydown', aoApertarTecla)
    campoTexto.value?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', aoApertarTecla))

</script>

<template>
    <div class="fundo" @click.self="emit('fechar')">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
            <header class="topo">
                <h2 id="titulo-modal">Nova Publicação</h2>
                <button type="button" class="fechar" aria-label="Fechar" @click="emit('fechar')">
                    <Icone nome="fechar" :tamanho="18"/>
                </button>
            </header>

            <div class="autor">
                <span class="avatar" aria-hidden="true">{{ usuario.iniciais }}</span>
                <div>
                    <strong>{{ usuario.nome }}</strong>
                    <small>{{ usuario.nivel }}</small>
                </div>
            </div>

            <textarea
              ref="campoTexto"
              v-model="texto"
              rows="7"
              maxlength="500"
              placeholder="Compartilhe sua conquista, experiência ou dica sustentável..."
              aria-label="Texto da publicação"
            />

            <div v-if="previa" class="previa">
                <img :src="previa" alt="Prévia da foto escolhida">
                <button type="button" class="remover" aria-label="Remover foto" @click="foto = null">
                    <Icone nome="fechar" :tamanho="14"/>
                </button>
            </div>

            <p v-if="erroLocal || erro" class="erro" role="alert">{{ erroLocal || erro }}</p>

            <footer class="rodape">
                <div class="ferramentas">
                    <input ref="entradaFoto" type="file" accept="image/*" hidden @change="escolherFoto">
                    <button type="button" class="ferramenta" @click="entradaFoto.click()">
                        <svg view-box="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" 
                        aria-hidden="true">
                            <rect x="3" y="3" width="18" height="16" fill="none"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-5-5l5 21"/>
                        </svg>
                        Foto
                    </button>

                    <label v-if="categorias.length" class="ferramentas">
                        <svg view-box="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
                        <circle cx="7.5" cy="7.5" r="1"/>
                    </svg>
                    <select v-model="categoria" aria-label="Categoria">
                        <option value="">Categoria</option>
                        <option v-for="c in categorias" :key="c.id" value="c.id">{{ c.nome }}</option>
                    </select>
                    </label>
                </div>

                <button type="button" class="publicar" :disabled="enviando" @click="enviar">
                    {{ enviando ? 'Publicando...' : 'Publicar' }}
                </button>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(6, 30, 16, 0.5);
}
.modal {
  display: grid;
  gap: 14px;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
  background: var(--superficie);
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.4);
}
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topo h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}
.fechar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--texto-suave);
  cursor: pointer;
}
.fechar:hover {
  background: var(--fundo);
  color: var(--texto);
}
 
.autor {
  display: flex;
  align-items: center;
  gap: 10px;
}
.autor strong {
  display: block;
  font-size: 14px;
}
.autor small {
  display: inline-block;
  margin-top: 2px;
  padding: 1px 8px;
  border-radius: 99px;
  background: var(--verde-100);
  color: #0f6b34;
  font-size: 11px;
  font-weight: 600;
}
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #0f7a3b);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
 
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid var(--borda);
  border-radius: 12px;
  background: var(--fundo);
  color: var(--texto);
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}
textarea:focus {
  outline: 0;
  border-color: var(--verde-600);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}
 
.previa {
  position: relative;
}
.previa img {
  display: block;
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
}
.remover {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
}
 
.erro {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #f7caca;
  border-radius: 10px;
  background: #fef1f1;
  color: #b91c1c;
  font-size: 13px;
}
 
.rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ferramentas {
  display: flex;
  gap: 8px;
}
.ferramenta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  background: var(--fundo);
  color: var(--texto);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.ferramenta:hover {
  border-color: var(--verde-600);
}
.ferramenta select {
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.publicar {
  height: 38px;
  padding: 0 22px;
  border: 0;
  border-radius: 10px;
  background: var(--verde-900);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.publicar:hover:not(:disabled) {
  background: var(--verde-950);
}
.publicar:disabled {
  opacity: 0.6;
  cursor: wait;
}
.fechar:focus-visible,
.ferramenta:focus-visible,
.publicar:focus-visible,
.remover:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
</style>