import { obterToken, sair } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1/senai/vibeEco'

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
        const corpo = await resposta.json()
        erro.codigo = corpo.codigo
        erro.campo = corpo.field
    } catch {
        /* resposta sem JSON */
    }

    // 401 (token vencido, inválido ou ausente): encerra a sessão e volta ao login
    if (resposta.status === 401) {
        sair()
        if (typeof window !== 'undefined' && window.location.pathname !== '/') window.location.assign('/')
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


// Para os serviços que usam fetch direto: devolve as opções com o cabeçalho Authorization (se houver token)
export function comAuth(opcoes = {}) {
    const token = obterToken()
    if (!token) return opcoes
    return { ...opcoes, headers: { ...(opcoes.headers || {}), Authorization: `Bearer ${token}` } }
}
