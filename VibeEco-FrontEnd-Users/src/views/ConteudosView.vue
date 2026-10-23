<script setup>
import { computed, ref } from 'vue'
import Icone from '@/components/Icone.vue'
 
// TODO: trocar os dados mockados abaixo por chamadas à API
// As imagens ficam em public/conteudos/ (ex.: public/conteudos/reciclagem.jpg)
const conteudos = [
  { id: 1, categoria: 'Reciclagem', titulo: 'Guia de Reciclagem Doméstica', leitura: 8, xp: 50, concluido: true, imagem: '/conteudos/reciclagem.jpg' },
  { id: 2, categoria: 'Energia', titulo: 'Energia Solar: Como Funciona', leitura: 12, xp: 75, concluido: false, imagem: '/conteudos/energia-solar.jpg' },
  { id: 3, categoria: 'Alimentação', titulo: 'Alimentação Sustentável no Dia a Dia', leitura: 6, xp: 60, concluido: false, imagem: '/conteudos/alimentacao.jpg' },
  { id: 4, categoria: 'Água', titulo: 'Consumo Consciente de Água', leitura: 7, xp: 50, concluido: true, imagem: '/conteudos/agua.jpg' },
  { id: 5, categoria: 'Reciclagem', titulo: 'Compostagem em Casa', leitura: 10, xp: 40, concluido: false, imagem: '/conteudos/compostagem.jpg' },
  { id: 6, categoria: 'Mobilidade', titulo: 'Mobilidade Urbana Sustentável', leitura: 9, xp: 60, concluido: false, imagem: '/conteudos/mobilidade.jpg' },
  { id: 7, categoria: 'Biodiversidade', titulo: 'Biodiversidade e Ecossistemas', leitura: 11, xp: 70, concluido: false, imagem: '/conteudos/biodiversidade.jpg' },
  { id: 8, categoria: 'Energia', titulo: 'Eficiência Energética em Casa', leitura: 8, xp: 50, concluido: true, imagem: '/conteudos/eficiencia-energetica.jpg' },
  { id: 9, categoria: 'Biodiversidade', titulo: 'Plantio Nativo e Reflorestamento', leitura: 13, xp: 80, concluido: false, imagem: '/conteudos/reflorestamento.jpg' },
]
 
// Ordem dos filtros igual ao Figma
const categorias = ['Todos', 'Água', 'Reciclagem', 'Energia', 'Alimentação', 'Biodiversidade', 'Mobilidade']
 
// Cor de fundo exibida enquanto a foto carrega (ou se a imagem não existir)
const fundoPorCategoria = {
  Água: ['#0ea5e9', '#0c4a6e'],
  Reciclagem: ['#22c55e', '#14532d'],
  Energia: ['#facc15', '#a16207'],
  Alimentação: ['#fb7185', '#9f1239'],
  Biodiversidade: ['#4ade80', '#166534'],
  Mobilidade: ['#a78bfa', '#4c1d95'],
}
function fundo(categoria) {
  const [a, b] = fundoPorCategoria[categoria] || ['#4ade80', '#14532d']
  return { background: `linear-gradient(135deg, ${a}, ${b})` }
}
 
const busca = ref('')
const categoriaAtiva = ref('Todos')
 
// Remove acentos e maiúsculas para a busca ("agua" encontra "Água")
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
 
const filtrados = computed(() => {
  const termo = normalizar(busca.value.trim())
  return conteudos.filter((c) => {
    const bateCategoria = categoriaAtiva.value === 'Todos' || c.categoria === categoriaAtiva.value
    const bateBusca = !termo || normalizar(c.titulo).includes(termo)
    return bateCategoria && bateBusca
  })
})
 
function limparFiltros() {
  busca.value = ''
  categoriaAtiva.value = 'Todos'
}
 
// Se a foto não carregar, some a <img> e fica só o fundo em degradê
function esconderImagem(evento) {
  evento.target.style.display = 'none'
}
</script>

<template>

</template>

<style scoped>
</style>