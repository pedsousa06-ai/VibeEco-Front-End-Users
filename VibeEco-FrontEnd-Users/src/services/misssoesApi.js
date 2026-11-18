import { apiGet } from '@/services/api'
import { idDoUsuario } from '@/services/sessao'

// lista fixa: o caminho da URL nunca vem de texto digitado por alguém
const ROTAS = {
  todas: 'todasmissoes',
  disponivel: 'missoesDisponiveis',
  andamento: 'missoesAndamento',
  concluida: 'missoesConcluidas',
}

export async function listarMissoes(filtro = 'todas') {
    const rota = ROTAS[filtro]
    if (!rota) throw new Error('Filtro inválido.')
    const dados = await apiGet(`/missoes/${rota}/${idDoUsuario()}`)
}