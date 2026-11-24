
import { idDoUsuario } from './sessao'
import { comAuth } from './api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1/senai/vibeEco'

export const ESCOPOS = [
  { id: 'geral', nome: 'Geral', sufixo: 'do ranking geral' },
  { id: 'instituicao', nome: 'Minha Instituição', sufixo: 'da sua instituição' },
  { id: 'grupo', nome: 'Meu Grupo', sufixo: 'do seu grupo' },
]

function iniciais(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(parte => parte.charAt(0).toUpperCase())
    .join('')
}

async function requisitarRanking(escopo, idUsuario) {
  const endpoints = {
    geral: '/ranking',
    instituicao: `/ranking/instituicao/${idUsuario}`,
    grupo: `/ranking/grupo/${idUsuario}`,
  }

  const endpoint = endpoints[escopo]

  if (!endpoint) {
    throw new Error('Escopo de ranking inválido.')
  }

  if (!API_URL) {
    throw new Error('A URL da API não foi configurada.')
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${endpoint}`, comAuth())
  } catch {
    throw new Error('Não foi possível conectar à API.')
  }

  let dados

  try {
    dados = await resposta.json()
  } catch {
    throw new Error('A API retornou uma resposta inválida.')
  }

  if (!resposta.ok || dados.status === false) {
    throw new Error(
      dados.message ||
      dados.mensagem ||
      'Não foi possível consultar o ranking.'
    )
  }

  return dados.response?.ranking ?? dados.ranking ?? dados
}

export async function montarRanking(escopoId) {
  const idUsuario = idDoUsuario()

  const dados = await requisitarRanking(escopoId, idUsuario)

  if (!Array.isArray(dados)) {
    throw new Error('Formato de ranking recebido da API é inválido.')
  }

  const lista = dados.map((usuario, indice) => {
    const nome = usuario.nome_usuario || usuario.nome || 'Usuário'

    return {
      id: usuario.id,
      nome,
      iniciais: iniciais(nome),
      instituicao: usuario.instituicao || 'Não informada',
      nivel: Number(usuario.nivel || 1),
      xp: Number(usuario.xp_usuario ?? usuario.total_xp ?? 0),
      foto: usuario.foto_usuario || usuario.foto || null,
      conquistas: Number(usuario.conquistas || 0),
      posicao: indice + 1,
      voce: Number(usuario.id) === Number(idUsuario),
    }
  })

  const eu = lista.find(usuario => usuario.voce) || null

  const percentual = eu && lista.length
    ? Math.max(1, Math.ceil((eu.posicao / lista.length) * 100))
    : 0

  return {
    lista,
    eu,
    percentual,
  }
}
