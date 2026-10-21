<script setup>

const usuario = {
    nome: 'Maria Alves',
    iniciais: 'MA',
    nivel: 'Nível 7 - Guardião',
    xp: 2450,
    xpProximoNivel: 3000,
    mc: 480,
    ofensiva: 8
}

const porcentagemNivel = Math.round((usuario.xp / usuario.xpProximoNivel) * 100)

const resumo = [
  { valor: '5', rotulo: ' Missões em Andamento', icone: '🎯', cor: 'verde' },
  { valor: '23', rotulo: ' Missões Concluídas', icone: '💡', cor: 'amarelo' },
  { valor: '2', rotulo: ' Desafios Ativos', icone: '⚡', cor: 'roxo' },
  { valor: '#14', rotulo: ' Posição no Ranking', detalhe: 'Top 5% na instituição', icone: '🏆', cor: 'laranja' }
]

const missoes = [
  { id: 1, categoria: 'Reciclagem', dificuldade: ' Médio', titulo: 'Descarte Consciente', xp: 150, prazo: '3 dias', progresso: 65 },
  { id: 2, categoria: 'Água', dificuldade: ' Fácil', titulo: 'Economia de Água', xp: 100, prazo: '4 dias', progresso: 30 },
  { id: 3, categoria: 'Alimentação', dificuldade: ' Difícil', titulo: 'Horta Comunitária', xp: 200, prazo: '2 dias', progresso: 80 }
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
        <!-- BANNER DE BOA-VINDAS -->
        <section class="banner">
            <div class="banner-texto">
              <small>Bom dia,</small>
              <h2>{{ usuario.nome }}!</h2>
              <p>
                Você está em uma ofensiva de <strong>{{ usuario.ofensiva }} dias</strong>. Continue assim!
              </p>

              <div class="banner-chips">
                <span>⭐ {{ usuario.xp.toLocaleString('pt-BR') }} XP</span>
                <span>🪙 {{ usuario.mc }} MC</span>
                <span>🔥 {{ usuario.ofensiva }} dias</span>
              </div>
            </div>

            <div class="banner-nivel">
              <div class="banner-avatar">{{ usuario.iniciais }}</div>
              <small>{{ usuario.nivel }}</small>

              <div class="barra barra-clara">
                <div class="barra-preenchimento" :style="{ width: porcentagemNivel + '%' }"></div>
              </div>
              <small class="banner-xp">
                {{ usuario.xp.toLocaleString('pt-BR') }} / {{ usuario.xpProximoNivel.toLocaleString('pt-BR') }} XP
              </small>
            </div>
        </section>

        <!-- CARDS DE RESUMO -->
        <section>
          <article v-for="item in resumo" :key="item.rotulo" class="card resumo-card">
            <div class="resumo-icone" :class="item-cor">{{ item.icone }}</div>

            <div>
              <strong>{{ item.valor }}</strong>
              <span>{{ item.rotulo }}</span>
              <small v-if="item.detalhe">{{ item.detalhe }}</small>
            </div>
          </article>
        </section>

        <div class="grade">
          <!-- COLUNA ESQUERDA -->
          <div class="coluna">
            <div class="cabeçalho-secao">
              <h3>Missões em Andamento</h3>
              <RouterLink to="/missoes"> Ver Todas ›</RouterLink>
            </div>

            <article v-for="missao in missoes" :key="missao.id" class="card missao">
              <div class="missao-topo">
                <div>
                  <span class="tag">{{ missao.categoria }}</span>
                  <span class="dificuldade">{{ missao.dificuldade }}</span>
                </div>
                <span class="xp">⭐ {{ missao.xp }} XP</span>
              </div>

              <div class="missao-meio">
                <strong>{{ missao.titulo }}</strong>
                <small>Prazo: {{ missao.prazo }}</small>
              </div>

              <div class="missao-progresso">
                <small>Progresso</small>
                <small>{{ missao.progresso }}%</small>
              </div>

              <div class="barra">
                <div class="barra-preenchimento" :style="{width: missao.progresso + '%'}"></div>
              </div>
            </article>

           </div>
        </div>

    </div>
</template>

<style scoped>
</style>