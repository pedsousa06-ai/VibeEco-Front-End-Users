import { apiGet } from "./api";
import { idDoUsuario } from "./sessao";

export async function carregarTelaInicial() {
    const dados = await apiGet(`/telaInicio/${idDoUsuario()}`)
    return dados.response.tela_inicial
}
