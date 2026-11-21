import { apiGet } from './api'
import { idDoUsuario } from './sessao'

// Mapeamento das rotas do seu backend
const ROTAS = {
  todas: 'todasmissoes',
  disponivel: 'missoesDisponiveis',
  andamento: 'missoesAndamento',
  concluida: 'missoesConcluidas'
}

export async function listarMissoes(filtro = 'todas') {
  const rota = ROTAS[filtro]
  if (!rota) throw new Error('Filtro inválido.')

  // Chama a API do backend (ex: /missoes/todasmissoes/1)
  const dados = await apiGet(`/missoes/${rota}/${idDoUsuario()}`)
  
  // Retorna o array de missões
  return dados.response.missoes ?? []
}