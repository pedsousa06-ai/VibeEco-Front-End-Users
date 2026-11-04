<script setup>
import { onMounted, ref } from 'vue';
import Icone from '@/components/Icone.vue';
import NovaPublicacaoModal from '@/components/NovaPublicacaoModal.vue'
import { criaPost, listarPostsRecentes } from '@/services/feed';
import { usuario } from '@/services/usuario';

const posts = ref([])
const carregando = ref(true)
const erroFeed = ref('')

// TODO: preencher com as categorias da API ([{ id, nome }]) quando existir uma rota que as liste
const categoriaPost = []

const modalAberto = ref(false)
const enviando = ref(false)
const erroPublicar = ref('')

async function carregar() {
    erroFeed.value = ''
    try{
        posts.value = await listarPostsRecentes()
    } catch (e) {
        erroFeed.value = e.message
    } finally {
        carregando.value = false
    }
}

function abrirModal(){
    erroPublicar.value = ''
    modalAberto.value = true
}

async function publicar({ texto, categoria, foto}) {
    enviando.value = true
    erroPublicar.value = ''
    try{
        await criaPost({ texto, categoriaId: categoria, foto, idUsuario: usuario.id })
        modalAberto.value = false
        await carregar()
    } catch (e) {
        erroPublicar.value = e.message
    } finally {
        enviando.value = false
    }
}

onMounted(carregar)

// TODO: ranking e desafios ainda não têm endpont no back-end 
const ranking = [
    { id: 1, nome: 'Carlos Mendes', iniciais: 'CM', xp: 4200, medalha: '🥇'},
    { id: 2, nome: 'Fernanda Lima', iniciais: 'FL', xp: 3850, medalha: '🥈'},
    { id: 3, nome: 'Rafael Costa', iniciais: 'RC', xp: 3600, medalha: '🥈'},
    { id: 4, nome: 'Ana Beatriz', iniciais: 'AB', xp: 3100, medalha: '#4'},
    { id: 5, nome: 'Lucas Nunes', iniciais: 'LN', xp: 2750, medalha: '#5'}
]
const desafios = [
    { id: 1, titulo: 'Semana sem Carro', detalhe: '234 participantes · 4 dias' },
    { id: 2, titulo: 'Desafio da Água', detalhe: '412 participantes · 1 dias' },
    { id: 3, titulo: 'Adote uma Área Verde', detalhe: '156 participantes · 8 dias' }
]
</script>

<template>

</template>

<style scoped>
</style>