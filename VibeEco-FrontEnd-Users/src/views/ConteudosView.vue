<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import Icone from '@/components/Icone.vue';
import { CATEGORIAS, estiloCapa, listarConteudos } from '@/services/conteudos';

const router = useRoute()

const conteudos = ref([])
const carregando = ref(true)
const busca = ref('')
const filtro = ref('Todos')
const categorias = ['Todos', ...CATEGORIAS]

</script>

<template>

</template>

<style scoped>

</style>