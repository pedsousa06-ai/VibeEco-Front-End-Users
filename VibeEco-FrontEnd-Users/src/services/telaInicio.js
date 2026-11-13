import { apiGet } from "./api";

// TEMPORÁRIO: sem login, o id vem do .env e só em desenvolvimento.
// Quando o login funcionar, o id sai da URL e o back-end lê do token.
function idDoUsuario() {
    if(import.meta.env.DEV) return Number(import.meta.env.VITE_DEV_USER_ID)
    throw new Error('Sessão inválida.')
}

export async function carregarTelaInicial() {
    const id = idDoUsuario()
    if (!Number.isInteger(id) || id <=0) throw new Error('Usuário inválido.')

    const dados = await apiGet(`/telaInicio/${id}`)
    return dados.response.tela_inicial
}