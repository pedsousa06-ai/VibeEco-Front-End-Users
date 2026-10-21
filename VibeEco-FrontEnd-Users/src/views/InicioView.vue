<script setup>

const usuario = {
    nome: 'Maria Alves',
    iniciais: 'MA',
    nivel: 'Nível 7 - Guardião',
    xp: 2450,
    xpProximoNivel: 3000,
    mc: 380,
    ofensiva: 7
}

const porcentagemNivel = Math.round((usuario.xp / usuario.xpProximoNivel) * 100)

const resumo = [
  { valor: '5', rotulo: 'Missões em Andamento', icone: '🎯', cor: 'verde' },
  { valor: '23', rotulo: 'Missões Concluídas', icone: '💡', cor: 'amarelo' },
  { valor: '2', rotulo: 'Desafios Ativos', icone: '⚡', cor: 'roxo' },
  { valor: '#14', rotulo: 'Posição no Ranking', detalhe: 'Top 5% na instituição', icone: '🏆', cor: 'laranja' }
]

const missoes = [
  { id: 1, categoria: 'Reciclagem', dificuldade: 'Médio', titulo: 'Descarte Consciente', xp: 150, prazo: '3 dias', progresso: 65 },
  { id: 2, categoria: 'Água', dificuldade: 'Fácil', titulo: 'Economia de Água', xp: 100, prazo: '4 dias', progresso: 30 },
  { id: 3, categoria: 'Alimentação', dificuldade: 'Difícil', titulo: 'Horta Comunitária', xp: 200, prazo: '2 dias', progresso: 80 }
]
 
const conteudos = [
  { id: 1, categoria: 'Reciclagem', titulo: 'Guia de Reciclagem Doméstica', leitura: '8 min leitura', xp: 50, concluido: true },
  { id: 2, categoria: 'Energia', titulo: 'Energia Solar: Como Funciona', leitura: '12 min leitura', xp: 75, concluido: false },
  { id: 3, categoria: 'Alimentação', titulo: 'Alimentação Sustentável', leitura: '6 min leitura', xp: 50, concluido: false }
]
 
const diasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
 
const desafios = [
  { id: 1, titulo: 'Semana sem Carro', participantes: 230, encerra: '5 dias', xp: 500 },
  { id: 2, titulo: 'Desafio da Água', participantes: 412, encerra: '1 dia', xp: 300 }
]
 
const conquistas = [
  { id: 1, nome: 'Primeira Missão', icone: '🌱' },
  { id: 2, nome: 'Reciclador', icone: '♻️' },
  { id: 3, nome: 'Guardião da Água', icone: '💧' },
  { id: 4, nome: 'Eco Energético', icone: '⚡' }
]

</script>

<template>
    <div class="inicio">
        <! -- BANNER DE BOA-VINDAS -- >
        <section class="banner">
            <div class="banner-texto">

            </div>
        </section>
    </div>
</template>

<style scoped>
</style>