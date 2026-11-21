// Desafios integrados à API (VibeEco-Back-End-Users).
// Rotas usadas:
//   GET  /desafios/todosUsuariosDesafiosIdUsuario/:idUsuario   todos os desafios + a situação do usuário
//   GET  /desafios/:idDesafio/usuario/:idUsuario               um desafio + a situação do usuário
//   POST /usuarioDesafio                                       participar (também vale para voltar após abandonar)
//   PUT  /usuarioDesafio/:id                                   { status: 'CONCLUIDO' | 'ABANDONADO' }
//
// O banco guarda por desafio: moedas (MC), prazo, tipo, dificuldade, meta de participantes e categorias.
// Não existem XP nem tarefas por desafio: o usuário marca o desafio inteiro como cumprido.
import { apiEnviar, apiGet } from '@/services/api'
import { idDoUsuario } from '@/services/sessao'
import { usuario } from '@/services/usuario'

export const DIFICULDADES = {
  facil: { rotulo: 'Fácil', fundo: '#e3f5ea', texto: '#15803d' },
  medio: { rotulo: 'Médio', fundo: '#fff1e0', texto: '#c2610c' },
  dificil: { rotulo: 'Difícil', fundo: '#fde8e8', texto: '#c81e1e' },
}

export const ESCOPOS = {
  individual: 'Individual',
  coletivo: 'Coletivo',
}

const semAcento = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

/* ---------- Cor da categoria ---------- */
// As categorias vêm do banco (o adm pode criar novas), então a cor é escolhida pelo nome.
const CORES_CATEGORIA = {
  agua: '#0ea5e9',
  'uso consciente da agua': '#0ea5e9',
  'economia de agua': '#0ea5e9',
  reciclagem: '#16a34a',
  sustentabilidade: '#166534',
  'meio ambiente': '#0f766e',
  energia: '#7c3aed',
  alimentacao: '#d97706',
  mobilidade: '#22c55e',
  biodiversidade: '#166534',
}
const PALETA = ['#0ea5e9', '#16a34a', '#d97706', '#7c3aed', '#0f766e', '#db2777', '#ca8a04', '#2563eb']

export function corDaCategoria(nome) {
  const chave = semAcento(nome)
  if (CORES_CATEGORIA[chave]) return CORES_CATEGORIA[chave]
  // categoria nova: o mesmo nome sempre cai na mesma cor
  let soma = 0
  for (const letra of chave) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0
  return PALETA[soma % PALETA.length]
}

function chaveDificuldade(nome) {
  const chave = semAcento(nome)
  return DIFICULDADES[chave] ? chave : 'medio'
}

/* ---------- Formato da API -> formato das telas ---------- */
// Linha devolvida pela API (procListarDesafioIdUsuarioTodos + o que o controller monta):
// { id_desafio, id_usuario_desafio, nome_desafio, descricao_desafio, coins_desafio, tipo_desafio,
//   nome_dificuldade, meta_participantes, qtde_participantes, progresso, status_desafio,
//   prazo_dias, encerrado, categoria: [{ nome_categoria }] }
// Quem ainda não entrou no desafio vem com id_usuario_desafio e status_desafio nulos.
function normalizar(linha) {
  const categorias = (linha.categoria ?? []).map((c) => c.nome_categoria)
  const status = linha.status_desafio ?? null

  return {
    id: linha.id_desafio,
    idUsuarioDesafio: linha.id_usuario_desafio ?? null,
    titulo: linha.nome_desafio,
    descricao: linha.descricao_desafio ?? '',
    categorias,
    cor: corDaCategoria(categorias[0]),
    escopo: semAcento(linha.tipo_desafio) === 'coletivo' ? 'coletivo' : 'individual',
    dificuldade: chaveDificuldade(linha.nome_dificuldade),
    participantes: Number(linha.qtde_participantes) || 0,
    meta: linha.meta_participantes == null ? null : Number(linha.meta_participantes),
    mc: Number(linha.coins_desafio) || 0,
    dias: linha.prazo_dias == null ? null : Number(linha.prazo_dias),
    encerrado: Boolean(linha.encerrado),
    status, // null | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ABANDONADO'
    progresso: Math.min(100, Math.max(0, Number(linha.progresso) || 0)),
    participando: status === 'EM_ANDAMENTO',
    concluido: status === 'CONCLUIDO',
  }
}

// Mantém status, progresso e os dois atalhos (participando/concluido) sempre juntos
function aplicarSituacao(desafio, status) {
  desafio.status = status
  desafio.participando = status === 'EM_ANDAMENTO'
  desafio.concluido = status === 'CONCLUIDO'
  desafio.progresso = status === 'CONCLUIDO' ? 100 : 0
}

/* ---------- Consultas ---------- */
export async function listarDesafios() {
  try {
    const dados = await apiGet(`/desafios/todosUsuariosDesafiosIdUsuario/${idDoUsuario()}`)
    return (dados.response.usuario_desafio ?? []).map(normalizar)
  } catch (erro) {
    if (erro.status === 404) return [] // ainda não há desafios cadastrados
    throw erro
  }
}

// Devolve null quando o desafio não existe (a tela mostra "Desafio não encontrado")
export async function carregarDesafio(id) {
  try {
    const dados = await apiGet(`/desafios/${encodeURIComponent(id)}/usuario/${idDoUsuario()}`)
    const linha = dados.response.usuario_desafio?.[0]
    return linha ? normalizar(linha) : null
  } catch (erro) {
    if (erro.status === 404 || erro.status === 400) return null
    throw erro
  }
}

/* ---------- Textos ---------- */
export function rotuloPrazo(desafio, completo = false) {
  if (desafio.encerrado) return 'Encerrado'
  if (desafio.dias == null) return 'Sem prazo'
  if (desafio.dias === 0) return 'Termina hoje'
  if (completo) return desafio.dias === 1 ? '1 dia restante' : `${desafio.dias} dias restantes`
  return desafio.dias === 1 ? '1 dia' : `${desafio.dias} dias`
}

// Mensagem para o usuário a partir do erro da API (o texto do servidor nunca é mostrado)
const MENSAGENS_DA_API = {
  DESAFIO_ENCERRADO: 'O prazo deste desafio já acabou.',
  DESAFIO_JA_CONCLUIDO: 'Você já concluiu este desafio.',
  DESAFIO_NAO_ESTA_EM_ANDAMENTO: 'Participe do desafio antes de concluí-lo.',
}

export function mensagemDeErro(erro, padrao) {
  if (erro?.codigo && MENSAGENS_DA_API[erro.codigo]) return MENSAGENS_DA_API[erro.codigo]
  if (erro?.status === 404) return 'Este desafio não foi encontrado.'
  return padrao
}

/* ---------- Ações ---------- */
// Entra no desafio (ou volta a ele depois de abandonar). Atualiza o objeto recebido.
export async function participar(desafio) {
  const dados = await apiEnviar('POST', '/usuarioDesafio', {
    id_usuario: idDoUsuario(),
    id_desafio: desafio.id,
  })
  const jaContava = desafio.status === 'EM_ANDAMENTO' || desafio.status === 'CONCLUIDO'
  desafio.idUsuarioDesafio = dados.response.id
  aplicarSituacao(desafio, 'EM_ANDAMENTO')
  if (!jaContava) desafio.participantes += 1
}

// Abandonar zera o progresso e tira o usuário da contagem de participantes
export async function abandonar(desafio) {
  await apiEnviar('PUT', `/usuarioDesafio/${desafio.idUsuarioDesafio}`, { status: 'ABANDONADO' })
  if (desafio.status === 'EM_ANDAMENTO') desafio.participantes = Math.max(0, desafio.participantes - 1)
  aplicarSituacao(desafio, 'ABANDONADO')
}

// Marca o desafio como cumprido. A API paga as Moedas Verdes; devolve quantas foram.
export async function concluirDesafio(desafio) {
  const dados = await apiEnviar('PUT', `/usuarioDesafio/${desafio.idUsuarioDesafio}`, { status: 'CONCLUIDO' })
  aplicarSituacao(desafio, 'CONCLUIDO')
  const ganhas = Number(dados.response.coins_ganhos) || 0
  usuario.mc += ganhas // atualiza o saldo mostrado na barra do topo
  return ganhas
}
