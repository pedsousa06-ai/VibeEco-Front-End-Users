import { obterToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL

export async function apiGet(caminho) {
    const headers = {}
    const token = obterToken()
    if (token) headers.Authorization = `Bearer ${token}`

    const resposta = await fetch(`${BASE_URL}${caminho}`, { headers })

    // mensagem genéricaca: não mostrar texto de erro do servidor para o usuário
    if(!resposta.ok) throw new Error('Não foi possível carregar os dados')
    
    return resposta.json()
}