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



</script>

<template>

</template>

<style scoped>
</style>