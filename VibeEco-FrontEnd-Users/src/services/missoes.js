// Missões simuladas, sem API. Os dados ficam em memória: recarregar a página (F5) volta ao início.
// Quando houver back-end, troque estas funções por chamadas reais e mantenha os mesmos nomes.
import { reactive } from 'vue'
import { usuario } from '@/services/usuario'

/* ---------- Construtores de etapa ---------- */
const confirmar = (titulo, xp, concluida = false) => ({ titulo, xp, tipo: 'confirmar', concluida })
const foto = (titulo, xp, necessarias, enviadas = 0, concluida = false) => ({
  titulo,
  xp,
  tipo: 'foto',
  fotosNecessarias: necessarias,
  fotosEnviadas: concluida ? necessarias : enviadas,
  concluida,
})
const quiz = (titulo, xp, perguntas) => ({ titulo, xp, tipo: 'quiz', perguntas, concluida: false })

function criar(dados) {
  return {
    participando: false,
    prazo: null,
    participantes: 0,
    ...dados,
    descricao:
      dados.descricao ?? `${dados.resumo} Complete todas as etapas para ganhar XP e Moedas Verdes.`,
    dica:
      dados.dica ?? 'Leia com atenção cada etapa antes de começar e registre tudo para não perder o progresso.',
    etapas: dados.etapas.map((etapa, i) => ({ id: i + 1, ...etapa })),
  }
}

/* ---------- Dados ---------- */
const missoes = reactive([
  criar({
    id: 1,
    categoria: 'Reciclagem',
    dificuldade: 'Médio',
    titulo: 'Descarte Consciente',
    resumo: 'Aprenda a separar e descartar resíduos de forma adequada no ambiente escolar.',
    descricao:
      'Aprenda a separar e descartar resíduos de forma adequada no ambiente escolar. Esta missão envolve identificar diferentes tipos de materiais recicláveis, compreender como deve ser feito o descarte correto e colocar em prática no cotidiano institucional.',
    dica: 'Utilize os pontos de coleta seletiva identificados pelo mapa da plataforma para facilitar o descarte correto dos materiais.',
    mc: 30,
    prazo: 3,
    participantes: 124,
    participando: true,
    etapas: [
      confirmar('Assistir ao vídeo introdutório', 20, true),
      confirmar('Separar resíduos por categoria', 40, true),
      foto('Fotografar o descarte correto', 50, 5, 3),
      quiz('Responder quiz sobre reciclagem', 40, [
        {
          texto: 'Qual cor de lixeira é usada para descartar plástico?',
          opcoes: ['Azul', 'Vermelho', 'Verde', 'Amarelo'],
          correta: 1,
        },
        {
          texto: 'Qual material deve ser colocado na lixeira azul?',
          opcoes: ['Vidro', 'Papel e papelão', 'Metal', 'Resíduo orgânico'],
          correta: 1,
        },
        {
          texto: 'Onde descartar restos de comida?',
          opcoes: ['Lixeira azul', 'Lixeira marrom', 'Lixeira verde', 'Lixeira amarela'],
          correta: 1,
        },
      ]),
    ],
  }),
  criar({
    id: 2,
    categoria: 'Água',
    dificuldade: 'Fácil',
    titulo: 'Economia de Água',
    resumo: 'Reduza o consumo de água adotando práticas simples no seu dia a dia.',
    mc: 20,
    prazo: 5,
    participantes: 98,
    participando: true,
    etapas: [
      confirmar('Ler o guia de economia de água', 20, true),
      foto('Registrar a economia diária', 20, 2, 1),
      confirmar('Reduzir o tempo do banho', 20),
      confirmar('Verificar vazamentos em casa', 20),
      confirmar('Compartilhar sua experiência', 20),
    ],
  }),
  criar({
    id: 3,
    categoria: 'Alimentação',
    dificuldade: 'Difícil',
    titulo: 'Horta Comunitária',
    resumo: 'Participe do cultivo de uma horta comunitária e promova alimentação saudável.',
    mc: 45,
    prazo: 2,
    participantes: 57,
    participando: true,
    etapas: [
      confirmar('Conhecer a horta da instituição', 40, true),
      confirmar('Participar de um mutirão', 40, true),
      confirmar('Plantar uma muda', 40, true),
      confirmar('Regar e cuidar por uma semana', 40, true),
      foto('Registrar a colheita', 40, 3),
    ],
  }),
  criar({
    id: 4,
    categoria: 'Energia',
    dificuldade: 'Fácil',
    titulo: 'Apague as Luzes',
    resumo: 'Monitore e reduza o consumo de energia elétrica no campus.',
    mc: 15,
    prazo: 7,
    participantes: 143,
    etapas: [
      confirmar('Mapear aparelhos ligados sem uso', 20),
      confirmar('Desligar as luzes ao sair', 30),
      foto('Registrar a economia', 30, 3),
    ],
  }),
  criar({
    id: 5,
    categoria: 'Meio Ambiente',
    dificuldade: 'Médio',
    titulo: 'Plantio de Mudas',
    resumo: 'Colabore com o plantio de mudas nativas em áreas verdes da instituição.',
    mc: 55,
    prazo: 10,
    participantes: 76,
    etapas: [
      confirmar('Escolher a espécie nativa', 50),
      confirmar('Preparar o solo', 60),
      foto('Plantar a muda', 70, 2),
      foto('Registrar o crescimento', 70, 1),
    ],
  }),
  criar({
    id: 6,
    categoria: 'Reciclagem',
    dificuldade: 'Médio',
    titulo: 'Compostagem Ativa',
    resumo: 'Configure e mantenha uma composteira ativa para resíduos orgânicos.',
    mc: 40,
    participantes: 64,
    participando: true,
    etapas: [
      confirmar('Montar a composteira', 45, true),
      confirmar('Separar os resíduos orgânicos', 45, true),
      foto('Registrar a primeira semana', 45, 2, 0, true),
      confirmar('Usar o adubo produzido', 45, true),
    ],
  }),
  criar({
    id: 7,
    categoria: 'Mobilidade',
    dificuldade: 'Fácil',
    titulo: 'Uso de Transporte Sustentável',
    resumo: 'Utilize transporte público, bicicleta ou a pé por uma semana.',
    mc: 28,
    participantes: 112,
    participando: true,
    etapas: [
      confirmar('Planejar os trajetos da semana', 40, true),
      confirmar('Usar transporte sustentável por 5 dias', 40, true),
      foto('Registrar um trajeto', 50, 1, 0, true),
    ],
  }),
])

/* ---------- Consultas ---------- */
export const missoesLista = missoes

export function buscarMissao(id) {
  return missoes.find((m) => m.id === Number(id))
}

export const xpTotal = (m) => m.etapas.reduce((soma, e) => soma + e.xp, 0)
export const etapasConcluidas = (m) => m.etapas.filter((e) => e.concluida).length

// Etapa concluída vale 1; etapa de fotos em andamento vale a fração já enviada
export function progressoDe(m) {
  if (!m.etapas.length) return 0
  const soma = m.etapas.reduce((acc, e) => {
    if (e.concluida) return acc + 1
    return e.tipo === 'foto' ? acc + e.fotosEnviadas / e.fotosNecessarias : acc
  }, 0)
  return Math.round((soma / m.etapas.length) * 100)
}

// 'concluida' | 'andamento' | 'disponivel'
export function statusDe(m) {
  if (m.etapas.every((e) => e.concluida)) return 'concluida'
  return m.participando ? 'andamento' : 'disponivel'
}

// Etapas são em sequência: a atual é a primeira que ainda não foi concluída
export function etapaAtual(m) {
  return m.participando ? m.etapas.find((e) => !e.concluida) ?? null : null
}

export const rotuloPrazo = (dias) => (dias === 1 ? '1 dia' : `${dias} dias`)

/* ---------- Ações ---------- */
// TODO: trocar por chamadas à API
export function participar(m) {
  m.participando = true
}

// Conclui a etapa, dá o XP dela e, se for a última, dá as Moedas Verdes da missão.
export function concluirEtapa(m, etapa) {
  if (etapa.concluida) return { missaoConcluida: false }
  etapa.concluida = true
  usuario.xp += etapa.xp
  const missaoConcluida = m.etapas.every((e) => e.concluida)
  if (missaoConcluida) usuario.mc += m.mc
  return { missaoConcluida }
}

// Registra uma foto; ao chegar no total pedido, a etapa é concluída automaticamente.
export function enviarFoto(m, etapa) {
  etapa.fotosEnviadas = Math.min(etapa.fotosEnviadas + 1, etapa.fotosNecessarias)
  if (etapa.fotosEnviadas >= etapa.fotosNecessarias) return concluirEtapa(m, etapa)
  return { missaoConcluida: false, parcial: true }
}
