// Integração do Feed com a API (VibeEco-Back-End-Users).
// A URL base pode ser trocada criando um arquivo .env na raiz do front com:
//   VITE_API_URL=http://localhost:8080/v1/senai/vibeEco
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/v1/senai/vibeEco'

async function requisitar(caminho, opcoes) {
  let resposta
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, opcoes)
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se ela está rodando.')
  }
  let corpo = null
  try {
    corpo = await resposta.json()
  } catch {
    /* resposta sem JSON */
  }
  return { ok: resposta.ok, status: resposta.status, corpo }
}

export function iniciaisDe(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

// A view do banco devolve a data como texto "dd/mm/aaaa hh:mm" (ex.: "04/11/2026 10:11").
// O JavaScript leria isso como mm/dd, por isso a conversão é feita aqui.
function lerData(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(String(texto ?? ''))
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] ?? 0), +(m[5] ?? 0))
  return new Date(texto)
}

export function tempoRelativo(data) {
  const momento = lerData(data)
  if (Number.isNaN(momento.getTime())) return ''
  const minutos = Math.floor((Date.now() - momento.getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `${minutos} min atrás`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas}h atrás`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `${dias}d atrás`
  return momento.toLocaleDateString('pt-BR')
}

// Formato real devolvido por vwPostRecente (+ o que o controller monta):
// { id, nome_usuario, foto_usuario, descricao_post, data_publicacao, qtde_curtida,
//   categoria: [{ nome_categoria }],
//   comentario: [{ id_post_comentario, nome_usuario, nome_comentario, data_comentario, ... }],
//   anexo: [{ id_anexo, nome_anexo, endereco_url }] }
function normalizarPost(p) {
  const nome = p.nome_usuario ?? 'Usuário'
  const anexos = Array.isArray(p.anexo) ? p.anexo : []
  const categorias = Array.isArray(p.categoria) ? p.categoria : []

  return {
    id: p.id,
    autor: nome,
    iniciais: iniciaisDe(nome),
    tempo: tempoRelativo(p.data_publicacao),
    texto: p.descricao_post ?? '',
    categoria: categorias[0]?.nome_categoria ?? null,
    imagem: anexos[0]?.endereco_url ?? null,
    curtidas: Number(p.qtde_curtida ?? 0),
    comentarios: Array.isArray(p.comentario) ? p.comentario.length : 0,
  }
}

async function listar(caminho) {
  const { ok, status, corpo } = await requisitar(caminho)
  if (status === 404) return [] // a API responde 404 quando ainda não há posts
  if (!ok) throw new Error(corpo?.message ?? `Erro ${status} ao carregar o feed.`)
  return (corpo?.response?.post ?? []).map(normalizarPost)
}

export const listarPostsRecentes = () => listar('/postRecente')
export const listarPostsRelevantes = () => listar('/postCurtida')

// POST /post (multipart). O controller exige: descricao e id_usuario.
// categoria, se enviada, é um JSON de lista de objetos com id: [{"id": 1}]
export async function criaPost({ texto, categoriaId, foto, idUsuario }) {
  const form = new FormData()
  form.append('descricao', texto)
  form.append('id_usuario', idUsuario)
  if (categoriaId) form.append('categoria', JSON.stringify([{ id: Number(categoriaId) }]))
  if (foto) form.append('anexos', foto) // mesmo nome do upload.array('anexos', 5) no app.js

  // Não definir Content-Type: o navegador coloca multipart/form-data com o boundary certo.
  const { ok, status, corpo } = await requisitar('/post', { method: 'POST', body: form })
  if (!ok) {
    const campo = corpo?.field ? ` ${corpo.field}` : ''
    throw new Error((corpo?.message ?? `Erro ${status} ao publicar.`) + campo)
  }
  return corpo
}