// Visual e destino de cada tipo de atividade/notificação.
// Usado pelas telas de Notificações e Histórico e pelo painel de detalhes.
export const TIPOS = {
  missao: {
    rotulo: 'Missão',
    icone: 'alvo',
    texto: '#16a34a',
    fundo: '#dcf5e5',
    destino: { to: '/missoes', rotulo: 'Ver missões' },
  },
  desafio: {
    rotulo: 'Desafio',
    icone: 'raio',
    texto: '#7c3aed',
    fundo: '#ede9fe',
    destino: { to: '/desafios', rotulo: 'Ver desafios' },
  },
  conquista: {
    rotulo: 'Conquista',
    icone: 'medalha',
    texto: '#ca8a04',
    fundo: '#fef3c7',
    destino: { to: '/inicio', rotulo: 'Ver conquistas' },
  },
  conteudo: {
    rotulo: 'Conteúdo',
    icone: 'livro',
    texto: '#0284c7',
    fundo: '#e0f2fe',
    destino: { to: '/conteudos', rotulo: 'Ver conteúdos' },
  },
  recompensa: {
    rotulo: 'Recompensa',
    icone: 'presente',
    texto: '#ea580c',
    fundo: '#ffedd5',
    destino: { to: '/recompensas', rotulo: 'Ver recompensas' },
  },
  social: {
    rotulo: 'Comunidade',
    icone: 'coracao',
    texto: '#db2777',
    fundo: '#fce7f3',
    destino: { to: '/feed', rotulo: 'Abrir o feed' },
  },
}
