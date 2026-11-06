import { computed, reactive } from 'vue'

// TODO: trocar os dados mockados por chamadas à API

export function tempoRelativo(minutos) {
  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `${minutos} min atrás`
  if (minutos < 1440) return `${Math.floor(minutos / 60)}h atrás`
  return `${Math.floor(minutos / 1440)}d atrás`
}

// `tipo` define ícone, cor e para onde o botão do detalhe leva (ver services/tipos.js)
export const notificacoes = reactive([
  {
    id: 1,
    tipo: 'missao',
    titulo: 'Missão concluída!',
    texto: "Você concluiu a missão 'Compostagem Ativa' e ganhou 180 XP e 40 Moedas Verdes.",
    minutosAtras: 0,
    lida: false,
    detalhes: [
      { rotulo: 'Missão', valor: 'Compostagem Ativa' },
      { rotulo: 'XP ganho', valor: '+180 XP' },
      { rotulo: 'Moedas Verdes', valor: '+40 MC' },
    ],
  },
  {
    id: 2,
    tipo: 'desafio',
    titulo: 'Novo desafio disponível',
    texto: "O 'Desafio Zero Resíduo' começou! Participe e concorra a 400 XP.",
    minutosAtras: 30,
    lida: false,
    detalhes: [
      { rotulo: 'Desafio', valor: 'Desafio Zero Resíduo' },
      { rotulo: 'Prêmio', valor: '400 XP' },
      { rotulo: 'Situação', valor: 'Aberto para participação' },
    ],
  },
  {
    id: 3,
    tipo: 'conquista',
    titulo: 'Conquista desbloqueada!',
    texto: "Você desbloqueou a conquista 'Guardião da Flora'. Parabéns!",
    minutosAtras: 60,
    lida: false,
    detalhes: [
      { rotulo: 'Conquista', valor: 'Guardião da Flora' },
      { rotulo: 'Bônus', valor: '+50 XP' },
    ],
  },
  {
    id: 4,
    tipo: 'conteudo',
    titulo: 'Novo conteúdo publicado',
    texto: "O artigo 'Energia Solar Residencial: Guia Completo' já está disponível na biblioteca.",
    minutosAtras: 120,
    lida: true,
    detalhes: [
      { rotulo: 'Artigo', valor: 'Energia Solar Residencial: Guia Completo' },
      { rotulo: 'Onde encontrar', valor: 'Biblioteca de conteúdos' },
    ],
  },
  {
    id: 5,
    tipo: 'social',
    titulo: 'Curtida no seu post',
    texto: 'Carlos Mendes e mais 12 pessoas curtiram sua publicação sobre compostagem.',
    minutosAtras: 180,
    lida: true,
    detalhes: [
      { rotulo: 'Publicação', valor: 'Compostagem' },
      { rotulo: 'Curtidas', valor: '13' },
    ],
  },
  {
    id: 6,
    tipo: 'recompensa',
    titulo: 'Recompensa disponível!',
    texto: "Você tem saldo suficiente para resgatar a 'Garrafa Sustentável VibeEco'.",
    minutosAtras: 300,
    lida: true,
    detalhes: [
      { rotulo: 'Recompensa', valor: 'Garrafa Sustentável VibeEco' },
      { rotulo: 'Custo', valor: '150 MC' },
      { rotulo: 'Seu saldo', valor: '380 MC' },
    ],
  },
  {
    id: 7,
    tipo: 'missao',
    titulo: 'Prazo se aproximando',
    texto: "A missão 'Horta Comunitária' vence em 2 dias. Continue o progresso!",
    minutosAtras: 1440,
    lida: true,
    detalhes: [
      { rotulo: 'Missão', valor: 'Horta Comunitária' },
      { rotulo: 'Prazo', valor: '2 dias' },
    ],
  },
  {
    id: 8,
    tipo: 'conquista',
    titulo: 'Nova conquista próxima',
    texto: "Você está a 50 XP de desbloquear a conquista 'Eco Energético'.",
    minutosAtras: 1440,
    lida: true,
    detalhes: [
      { rotulo: 'Conquista', valor: 'Eco Energético' },
      { rotulo: 'Faltam', valor: '50 XP' },
    ],
  },
])

// Use no menu lateral e no sino do topo (ex.: <span v-if="naoLidas">{{ naoLidas }}</span>)
export const naoLidas = computed(() => notificacoes.filter((n) => !n.lida).length)

export function marcarComoLida(id) {
  const notificacao = notificacoes.find((n) => n.id === id)
  if (notificacao) notificacao.lida = true
}

export function marcarTodasComoLidas() {
  notificacoes.forEach((n) => (n.lida = true))
}
