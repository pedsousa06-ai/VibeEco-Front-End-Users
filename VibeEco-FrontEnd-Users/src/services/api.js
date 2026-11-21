import { obterToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL

function montarCabecalhos(comCorpo) {
    const headers = {}
    const token = obterToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (comCorpo) headers['Content-Type'] = 'application/json'
    return headers
}

// O erro leva o status HTTP e, quando a API manda, o "codigo" da regra de negócio
// (ex.: DESAFIO_ENCERRADO). Assim a tela escolhe a mensagem sem depender do texto do servidor.
async function erroDaResposta(resposta) {
    // mensagem genérica: não mostrar texto de erro do servidor para o usuário
    const erro = new Error('Não foi possível carregar os dados')
    erro.status = resposta.status
    try {
        erro.codigo = (await resposta.json()).codigo
    } catch {
        /* resposta sem JSON */
    }
    return erro
}

export async function apiGet(caminho) {
    const resposta = await fetch(`${BASE_URL}${caminho}`, { headers: montarCabecalhos(false) })

    if(!resposta.ok) throw await erroDaResposta(resposta)

    return resposta.json()
}

// Envia JSON para a API (POST, PUT...)
export async function apiEnviar(metodo, caminho, corpo) {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
        method: metodo,
        headers: montarCabecalhos(true),
        body: JSON.stringify(corpo ?? {}),
    })

    if(!resposta.ok) throw await erroDaResposta(resposta)

    return resposta.json()
}
