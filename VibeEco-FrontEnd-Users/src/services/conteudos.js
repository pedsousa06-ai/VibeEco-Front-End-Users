import { usuario } from '@/services/usuario'

const API_BASE = 'http://localhost:8080/v1/senai/vibeEco'

// Lista todos os conteúdos educativos do usuário
export async function listarConteudos() {
  const idUsuario = usuario.id ?? usuario.id_usuario

  if (!idUsuario) {
    throw new Error('Usuário não identificado.')
  }

  const response = await fetch(
    `${API_BASE}/conteudoEducativo/usuario/${idUsuario}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Erro ao listar conteúdos educativos.'
    )
  }

  return (data.response || []).map((item) => ({
    id: item.id,
    titulo: item.nome,
    descricao: item.descricao,
    img: item.img,
    minutos: item.duracao_leitura,
    xp: item.qtde_xp,
    categoria: item.categoria || 'Sem categoria',
    concluido: Boolean(item.concluido)
  }))
}

// Busca um conteúdo específico
export async function obterConteudo(id, idUsuario) {
  const response = await fetch(
    `${API_BASE}/conteudoEducativo/${id}/usuario/${idUsuario}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Erro ao buscar conteúdo.'
    )
  }

  const item = data.response

  if (!item) {
    throw new Error('Conteúdo não encontrado.')
  }

  return {
    id: item.id,
    titulo: item.nome,
    descricao: item.descricao,
    img: item.img,
    minutos: item.duracao_leitura,
    xp: item.qtde_xp,
    categoria: item.categoria || 'Sem categoria',
    concluido: Boolean(item.concluido)
  }
}

// Conclui uma leitura
export async function concluirConteudo(id, idUsuario, tempoAcesso) {
  const response = await fetch(
    `${API_BASE}/conteudoEducativo/${id}/usuario/${idUsuario}/concluir`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tempo_acesso: Number(tempoAcesso)
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Erro ao concluir leitura.'
    )
  }

  return data.response
}

// Mantém compatibilidade com componentes que usam concluirLeitura
export const concluirLeitura = concluirConteudo

// Estilo da imagem de capa
export function estiloCapa(conteudo) {
  return {
    backgroundImage: `url("${conteudo.img}")`
  }
}