// Ranking simulado, sem API. Quando houver back-end, troque montarRanking() por uma chamada real
// e mantenha o formato do retorno.
// A posição da usuária logada é calculada com o XP real dela (services/usuario.js), então
// concluir missões faz o ranking dela subir.
import { usuario } from '@/services/usuario'

const INSTITUICAO_USUARIO = 'UFMG'

// Total de participantes de cada escopo (usado só para calcular "Top X%")
const TOTAL_GERAL = 175
const TOTAL_INSTITUICAO = 60

export const ESCOPOS = [
  { id: 'geral', nome: 'Geral', sufixo: 'da instituição' },
  { id: 'instituicao', nome: 'Minha Instituição', sufixo: 'da sua instituição' },
  { id: 'grupo', nome: 'Meu Grupo', sufixo: 'do seu grupo' },
]

const participantes = [
  { id: 1, nome: 'Carlos Mendes', iniciais: 'CM', instituicao: 'UFMG', nivel: 9, xp: 4200, conquistas: 12, grupo: false },
  { id: 2, nome: 'Fernanda Lima', iniciais: 'FL', instituicao: 'UFMG', nivel: 8, xp: 3850, conquistas: 9, grupo: true },
  { id: 3, nome: 'Rafael Costa', iniciais: 'RC', instituicao: 'UFMG', nivel: 8, xp: 3600, conquistas: 11, grupo: false },
  { id: 4, nome: 'Ana Beatriz', iniciais: 'AB', instituicao: 'UFMG', nivel: 7, xp: 3100, conquistas: 7, grupo: true },
  { id: 5, nome: 'Lucas Nunes', iniciais: 'LN', instituicao: 'UFMG', nivel: 7, xp: 2750, conquistas: 6, grupo: true },
  { id: 6, nome: 'Beatriz Santos', iniciais: 'BS', instituicao: 'UFMG', nivel: 7, xp: 2650, conquistas: 5, grupo: false },
  { id: 7, nome: 'Pedro Oliveira', iniciais: 'PO', instituicao: 'UFMG', nivel: 6, xp: 2480, conquistas: 4, grupo: true },
  { id: 8, nome: 'Juliana Rocha', iniciais: 'JR', instituicao: 'USP', nivel: 6, xp: 2470, conquistas: 4, grupo: false },
  { id: 9, nome: 'Mateus Vieira', iniciais: 'MV', instituicao: 'USP', nivel: 6, xp: 2465, conquistas: 3, grupo: false },
  { id: 10, nome: 'Camila Prado', iniciais: 'CP', instituicao: 'UNICAMP', nivel: 6, xp: 2460, conquistas: 4, grupo: false },
  { id: 11, nome: 'Bruno Tavares', iniciais: 'BT', instituicao: 'UFRJ', nivel: 6, xp: 2458, conquistas: 3, grupo: false },
  { id: 12, nome: 'Letícia Moraes', iniciais: 'LM', instituicao: 'UFRJ', nivel: 6, xp: 2455, conquistas: 3, grupo: false },
  { id: 13, nome: 'Gustavo Pires', iniciais: 'GP', instituicao: 'UNICAMP', nivel: 6, xp: 2452, conquistas: 2, grupo: false },
]

// "Nível 7 - Guardião" -> 7
const nivelDoUsuario = () => Number(usuario.nivel.match(/\d+/)?.[0] ?? 1)

// Devolve a lista ordenada por XP (com a posição de cada um), a usuária logada e o "Top X%".
export function montarRanking(escopoId) {
  const eu = {
    id: 'eu',
    nome: usuario.nome,
    iniciais: usuario.iniciais,
    instituicao: INSTITUICAO_USUARIO,
    nivel: nivelDoUsuario(),
    xp: usuario.xp,
    conquistas: 8,
    grupo: true,
    voce: true,
  }

  let base = [...participantes, eu]
  if (escopoId === 'instituicao') base = base.filter((p) => p.instituicao === INSTITUICAO_USUARIO)
  if (escopoId === 'grupo') base = base.filter((p) => p.grupo)

  // Em empate, a usuária fica atrás (critério simples e previsível)
  base.sort((a, b) => b.xp - a.xp || (a.voce ? 1 : b.voce ? -1 : 0))
  const lista = base.map((p, i) => ({ ...p, posicao: i + 1 }))

  const total =
    escopoId === 'geral' ? TOTAL_GERAL : escopoId === 'instituicao' ? TOTAL_INSTITUICAO : lista.length
  const euNaLista = lista.find((p) => p.voce)

  return {
    lista,
    eu: euNaLista,
    percentual: Math.max(1, Math.ceil((euNaLista.posicao / total) * 100)),
  }
}
