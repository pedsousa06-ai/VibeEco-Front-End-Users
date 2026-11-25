
/* =========================================================
   SERVIÇO DE MISSÕES - VIBEECO
   Integração com a API real
========================================================= */

import { idDoUsuario } from './sessao'
import { apiGet, apiEnviar } from './api'

// Mensagens amigáveis para os erros que a API devolve ao concluir etapas
function erroAmigavel(erro, padrao) {
    const campo = String(erro?.campo ?? '')
    if (erro?.status === 409 && campo.includes('PRAZO')) return new Error('O prazo desta missão foi encerrado.')
    if (erro?.status === 409 && campo.includes('JÁ CONCLUÍDA')) return new Error('Esta etapa já foi concluída.')
    if (erro?.status === 409) return new Error('Esta missão não está em andamento.')
    if (erro?.status === 404) return new Error('Você ainda não participa desta missão.')
    return new Error(padrao)
}

// =========================================================
// NORMALIZAÇÃO DOS DADOS DA API
// =========================================================

function normalizarMissao(missao) {
    const etapas = (missao.etapas ?? []).map(etapa => ({
        ...etapa,
        id: Number(etapa.id),
        xp: Number(etapa.xp ?? 0),
        concluida:
            etapa.concluida === true ||
            etapa.concluida === 1 ||
            etapa.concluida === '1',
    }))

    const status = String(
        missao.status_missao ?? ''
    ).toUpperCase()

    return {
        ...missao,

        id: Number(missao.id_missao),
        id_missao: Number(missao.id_missao),

        titulo: missao.nome_missao,
        nome_missao: missao.nome_missao,

        resumo: missao.descricao_missao,
        descricao: missao.descricao_missao,
        descricao_missao: missao.descricao_missao,

        xp: Number(missao.xp_missao ?? 0),
        xp_missao: Number(missao.xp_missao ?? 0),

        mc: Number(missao.coins_missao ?? 0),
        coins_missao: Number(missao.coins_missao ?? 0),

        dificuldade: missao.nome_dificuldade,
        nome_dificuldade: missao.nome_dificuldade,

        prazo: Number(missao.prazo_dias ?? 0),
        prazo_dias: Number(missao.prazo_dias ?? 0),

        categoria: missao.categoria ?? '',
        categorias: missao.categorias ?? [],

        status_missao: status,

        progresso_missao: Number(
            missao.progresso_missao ?? 0
        ),

        participando: [
            'EM_ANDAMENTO',
            'CONCLUIDA',
        ].includes(status),

        etapas,
    }
}

// =========================================================
// LISTAR MISSÕES
// =========================================================

export async function listarMissoesCompletas() {
    const idUsuario = idDoUsuario()

    if (!idUsuario) {
        throw new Error('Usuário não identificado na sessão.')
    }

    const dados = await apiGet(`/missoes/todasmissoes/${idUsuario}`)

    const lista = dados?.response?.missoes

    if (!Array.isArray(lista)) {
        throw new Error(
            'A API não retornou uma lista válida de missões.'
        )
    }

    return lista.map(normalizarMissao)
}

// =========================================================
// BUSCAR UMA MISSÃO
// =========================================================

export async function buscarMissao(id) {
    const missoes = await listarMissoesCompletas()

    return missoes.find(
        missao => Number(missao.id_missao) === Number(id)
    ) ?? null
}

// =========================================================
// CÁLCULOS
// =========================================================

export const xpTotal = missao =>
    Number(missao?.xp_missao ?? missao?.xp ?? 0)

export const etapasConcluidas = missao =>
    (missao?.etapas ?? []).filter(
        etapa => etapa.concluida
    ).length

export function progressoDe(missao) {
    return Math.min(
        100,
        Math.max(
            0,
            Number(missao?.progresso_missao ?? 0)
        )
    )
}

export function statusDe(missao) {
    const status = String(
        missao?.status_missao ?? ''
    ).toUpperCase()

    if (['CONCLUIDA', 'CONCLUÍDA'].includes(status)) {
        return 'concluida'
    }

    if (['EM_ANDAMENTO', 'ANDAMENTO'].includes(status)) {
        return 'andamento'
    }

    return 'disponivel'
}

export function etapaAtual(missao) {
    if (statusDe(missao) !== 'andamento') {
        return null
    }

    return missao.etapas?.find(
        etapa => !etapa.concluida
    ) ?? null
}

export const rotuloPrazo = dias => {
    if (dias == null) return 'Não definido'

    return Number(dias) === 1
        ? '1 dia'
        : `${dias} dias`
}

// =========================================================
// PARTICIPAR DE UMA MISSÃO
// =========================================================

export async function participar(missao) {
    const idUsuario = idDoUsuario()
    const idMissao = missao?.id_missao ?? missao?.id

    if (!idUsuario) {
        throw new Error('Usuário não identificado na sessão.')
    }

    if (!idMissao) {
        throw new Error('Missão não identificada.')
    }

    try {
        return await apiEnviar('POST', '/usuarioMissao', {
            id_usuario: idUsuario,
            id_missao: idMissao,
        })
    } catch (erro) {
        if (erro?.status === 409) throw new Error('Você já participa desta missão.')
        throw new Error('Não foi possível entrar na missão. Tente novamente.')
    }
}

// =========================================================
// CONCLUIR UMA ETAPA
// =========================================================

// POST /usuarioEtapa: a procedure grava a etapa, soma XP e, na última etapa,
// conclui a missão e paga as moedas. Retorna { missaoConcluida, progresso, status }.
export async function concluirEtapa(missao, etapa) {
    const idUsuario = idDoUsuario()

    if (!idUsuario) throw new Error('Usuário não identificado na sessão.')
    if (!etapa?.id) throw new Error('Etapa não identificada.')

    try {
        const dados = await apiEnviar('POST', '/usuarioEtapa', {
            id_usuario: idUsuario,
            id_etapa: etapa.id,
        })
        const status = String(dados?.response?.status ?? '').toUpperCase()
        return {
            missaoConcluida: status === 'CONCLUIDA',
            progresso: Number(dados?.response?.progresso ?? 0),
            status,
        }
    } catch (erro) {
        throw erroAmigavel(erro, 'Não foi possível salvar a etapa. Tente novamente.')
    }
}
