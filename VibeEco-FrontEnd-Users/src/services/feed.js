// Integração do Feed com a API (VibeEco-Back-End-User).
// A URL base pode ser trocada criando um arquivo .env na raiz no front com:

// VITE_API_URL=http://localhost:8080/v1/senai/vibeEco
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/v1/senai/vibeEco'

async function requisitar(caminho, opcoes) {
    let resposta
    try{
        resposta = await fetch(`${BASE_URL}${caminho}`, opcoes)
    } catch {
        throw new Error('Não foi possível conectar à API. Confira se ea está rodando.')
    }
    let corpo = null
    try{
        corpo = await resposta.json()
    } catch {
        /* resposta sem JSON */
    }
    return { ok: resposta.ok, status: resposta.status, corpo}
}

export function iniciasDe(nome = '') {
    return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

export function tempoRelativo(data){
    const momento = new Date(data)
    if(Number.isNaN(momento.getTime())) return ''
    const minutos = Math.floor((Data.now() - momento.getTime()) / 60000)
    if(minutos < 1) return 'agora'
    if(minutos < 60) return `${minutos} min atrás`
    const horas = Math.floor(minutos / 60)
    if(horas < 24) return `${horas}h atrás`
    const dias = Math.floor(horas / 24)
    if(dias < 30) return `${dias}d atrás`
    return momento.toLocaleDateString('pt-BR')
}

// >>> Os campos marcados com "?" abaixo dependem do model/DAO/post: confirme com um JSON real. <<<
function normalizarPost(p){
    const autor = p.usuario ?? {}
    const nome = autor.nome ?? p.nome_usuario ?? p.nome ?? 'Usuário' //?
    const anexos = Array.isArray(p.anexo) ? p.anexo : []
    const primeiro = anexos[0]
    const imagem = primeiro
        ? typeof primeiro === 'string'
          ? primeiro
          : (primeiro.url ?? primeiro.link ?? primeiro.caminho ?? primeiro.url_anexo ?? null) //?
          : null
    const categorias = Array.isArray(p.categoria) ? p.categoria : []

    return {
        id: p.id,
        autor: nome,
        inicias: iniciasDe(nome),
        tempo: tempoRelativo(p.data_cricao ?? p.data_publicacao ?? p.data ?? p.created_at), //?
        texto: p.descricao ?? '',
        categoria: categorias[0]?.nome ?? categorias[0]?.categoria ?? null,//?
        imagem,
        curtidas: Number(p.curtidas ?? p.total_curtidas ?? 0),//?
        comentarios: Array.isArray(p.comentario) ? p.comentario.length : 0,
    }
}

async function listar(caminho) {
    const { ok, status, corpo } = await requisitar(caminho)
    if(status === 404) return [] // a API responde 404 quando ainda não há posts
    
    if(!ok) throw new Error(corpo?.message ?? `Erro ${status} ao carregar o feed`)
    return (corpo?.response?.post ?? []).map(normalizarPost)
}

export const listarPostsRecentes = () => listar('/postRecente')
export const listarPostsRelevantes = () => listar('/postCurtida')

export async function criaPost({ texto, categoriaId, foto, idUsuario}) {
    const form = new FormData()
    form.append('descricao', texto)
    form.append('id_usuario', idUsuario)
    if(categoriaId) form.append('categoria', JSON.stringify([{ id: Number(categoriaId) }]))
    
    if(foto) form.append('anexos', foto) // mesmo nome do upload.array ('anexos', 5) no app.js

    const {ok,status, corpo } = await requisitar('/post', { method: 'POST', body: form })

    if(!ok){
        const campo = corpo?.field ? ` ${corpo.field}` : ''
        throw new Error((corpo?.message ?? `Erro ${status} ao publicar.`) + campo)
    }
    return corpo
}