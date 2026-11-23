// Visual e destino de cada tipo de atividade/notificação.
// Usado pelas telas de Notificações e Histórico e pelo painel de detalhes.

const fundo = (cor) => `color-mix(in srgb, ${cor} 16%, var(--superficie))`
const texto = (cor) => `color-mix(in srgb, ${cor} 75%, var(--texto))`

export const TIPOS = {
  missao: {
    rotulo: 'Missão',
    icone: 'alvo',
    texto: texto('#16a34a'),
    fundo: fundo('#16a34a'),
    destino: { to: '/missoes', rotulo: 'Ver missões' },
  },
  desafio: {
    rotulo: 'Desafio',
    icone: 'raio',
    texto: texto('#7c3aed'),
    fundo: fundo('#7c3aed'),
    destino: { to: '/desafios', rotulo: 'Ver desafios' },
  },
  conquista: {
    rotulo: 'Conquista',
    icone: 'medalha',
    texto: texto('#ca8a04'),
    fundo: fundo('#ca8a04'),
    destino: { to: '/inicio', rotulo: 'Ver conquistas' },
  },
  conteudo: {
    rotulo: 'Conteúdo',
    icone: 'livro',
    texto: texto('#0284c7'),
    fundo: fundo('#0284c7'),
    destino: { to: '/conteudos', rotulo: 'Ver conteúdos' },
  },
  recompensa: {
    rotulo: 'Recompensa',
    icone: 'presente',
    texto: texto('#ea580c'),
    fundo: fundo('#ea580c'),
    destino: { to: '/recompensas', rotulo: 'Ver recompensas' },
  },
  social: {
    rotulo: 'Comunidade',
    icone: 'coracao',
    texto: texto('#db2777'),
    fundo: fundo('#db2777'),
    destino: { to: '/feed', rotulo: 'Abrir o feed' },
  },
}

