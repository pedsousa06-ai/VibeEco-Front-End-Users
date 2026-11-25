import { apiGet, apiEnviar } from './api'
import { idDoUsuario } from './sessao'

const paraConteudo = (item) => ({
  id: item.id,
  titulo: item.nome,
  descricao: item.descricao,
  img: item.img,
  minutos: item.duracao_leitura,
  xp: item.qtde_xp,
  categoria: item.categoria || 'Sem categoria',
  concluido: Boolean(item.concluido)
})

// GET /conteudoEducativo/usuario/:idUsuario - lista com o status de conclusão do usuário
export async function listarConteudos() {
  const idUsuario = idDoUsuario()
  if (!idUsuario) throw new Error('Usuário não identificado.')

  const data = await apiGet(`/conteudoEducativo/usuario/${idUsuario}`)
  return (Array.isArray(data.response) ? data.response : []).map(paraConteudo)
}

// GET /conteudoEducativo/:id/usuario/:idUsuario - um conteúdo (e registra o acesso)
export async function obterConteudo(id, idUsuario = idDoUsuario()) {
  const data = await apiGet(`/conteudoEducativo/${id}/usuario/${idUsuario}`)
  if (!data.response) throw new Error('Conteúdo não encontrado.')
  return paraConteudo(data.response)
}

// POST /conteudoEducativo/:id/usuario/:idUsuario/concluir - conclui a leitura e soma o XP uma única vez
export async function concluirConteudo(id, idUsuario = idDoUsuario(), tempoAcesso = 0) {
  const data = await apiEnviar('POST', `/conteudoEducativo/${id}/usuario/${idUsuario}/concluir`, {
    tempo_acesso: Number(tempoAcesso) || 0
  })
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