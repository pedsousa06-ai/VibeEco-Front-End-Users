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



</script>

<template>

</template>

<style scoped>
</style>