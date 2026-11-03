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
        Texto: texto.value.trim(),
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
                            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l 7.6 7.6a2 2 0 0 1 0 2.8z"/>
                        </svg>
                    </label>
                </div>
            </footer>

        </div>
    </div>

</template>

<style scoped>
</style>