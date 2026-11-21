// Perfil integrado à API (VibeEco-Back-End-Users).
// Rotas usadas:
//   GET /perfil/:idUsuario   dados do usuário, desempenho (7 dias, 30 dias, todo período),
//                            posição no ranking, evolução de XP (12 semanas) e conquistas
//   PUT /perfil/:idUsuario   { nome, nomePublico, curso, localizacao, bio }
//   GET /missoes/todasmissoes/:idUsuario   (missões exibidas no fim da tela)
import { apiEnviar, apiGet } from '@/services/api'
import { idDoUsuario } from '@/services/sessao'
import { usuario } from '@/services/usuario'
import { listarMissoes } from '@/services/misssoesApi'

export const PERIODOS = [
    { valor: '7', rotulo: '7 dias', nota: 'nos últimos 7 dias' },
    { valor: '30', rotulo: '30 dias', nota: 'nos últimos 30 dias' },
    { valor: 'todo', rotulo: 'Todo período', nota: 'desde o início' },
]

const formatar = (n) => Number(n || 0).toLocaleString('pt-BR')

export function iniciaisDe(nome = '') {
    const partes = String(nome).trim().split(/\s+/).filter(Boolean)
    if (!partes.length) return ''
    const primeira = partes[0][0]
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
    return (primeira + ultima).toUpperCase()
}

// "2026-11-21T10:00:00.000Z" -> "novembro de 2026" ('' quando não há data)
export function desdeDe(data) {
    if (!data) return ''
    const d = new Date(data)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/* ---------- Carregar ---------- */
// Busca o perfil, atualiza o usuário compartilhado (barra do topo e menu) e devolve o resto.
export async function carregarPerfil() {
    const dados = await apiGet(`/perfil/${idDoUsuario()}`)
    const p = dados.response.perfil
    sincronizarUsuario(p.usuario)

    return {
        desempenho: p.desempenho,
        ranking: p.ranking,
        evolucao: montarEvolucao(p.evolucao_xp),
        conquistas: montarConquistas(p.conquistas),
    }
}

// Preenche o usuário compartilhado (menu lateral, barra do topo e telas) com os dados reais.
export function sincronizarUsuario(u) {
    Object.assign(usuario, {
        id: u.id,
        nome: u.nome,
        email: u.email,
        foto: u.foto,
        iniciais: iniciaisDe(u.nome),
        nivel: u.numero_level != null ? `Nível ${u.numero_level} - ${u.nome_level}` : '',
        xp: u.xp,
        xpProximoNivel: u.xp_proximo_level ?? u.xp,
        mc: u.coins,
        matricula: u.matricula,
        nomePublico: u.nome_publico,
        curso: u.curso,
        instituicao: u.instituicao,
        localizacao: u.localizacao,
        desde: desdeDe(u.data_cadastro),
        bio: u.bio,
    })
}

// Usado pelo layout ao abrir o app: só traz os dados do usuário logado
export async function carregarUsuarioLogado() {
    const dados = await apiGet(`/perfil/${idDoUsuario()}`)
    sincronizarUsuario(dados.response.perfil.usuario)
}

/* ---------- Salvar ---------- */
export async function salvarPerfil(form) {
    const dados = await apiEnviar('PUT', `/perfil/${idDoUsuario()}`, {
        nome: form.nome,
        nomePublico: form.nomePublico,
        curso: form.curso,
        localizacao: form.localizacao,
        bio: form.bio,
    })
    const r = dados.response
    Object.assign(usuario, {
        nome: r.nome,
        iniciais: iniciaisDe(r.nome),
        nomePublico: r.nome_publico,
        curso: r.curso,
        localizacao: r.localizacao,
        bio: r.bio,
    })
}

// A API manda mensagem própria no 400 (ex.: "bio aceita no máximo 160"), mas o texto do servidor
// nunca é mostrado: a tela usa a mensagem abaixo.
export function mensagemDeErroSalvar(erro) {
    if (erro?.status === 400) return 'Confira os campos: o nome é obrigatório e os textos têm tamanho máximo.'
    if (erro?.status === 404) return 'Usuário não encontrado.'
    return 'Não foi possível salvar o perfil. Tente novamente.'
}

/* ---------- Desempenho (cartões do período) ---------- */
export function obterDesempenho(perfil, usr, periodoValor) {
    const periodo = PERIODOS.find((p) => p.valor === periodoValor) ?? PERIODOS[1]
    const d = perfil.desempenho[periodo.valor] ?? { xp_ganho: 0, mc_ganho: 0, missoes_concluidas: 0 }
    const r = perfil.ranking

    return [
        { id: 'xp', icone: 'estrelaC', valor: formatar(usr.xp), rotulo: 'XP acumulado',
          nota: `+${formatar(d.xp_ganho)} ${periodo.nota}` },
        { id: 'ranking', icone: 'trofeu', valor: r.posicao ? `#${r.posicao}` : '—', rotulo: 'Posição no ranking',
          nota: r.total ? `Entre ${formatar(r.total)} participantes` : 'Ranking indisponível' },
        { id: 'missoes', icone: 'checkC', valor: String(d.missoes_concluidas), rotulo: 'Missões concluídas',
          nota: periodo.valor === 'todo' ? 'desde o início' : periodo.nota },
        { id: 'mc', icone: 'moeda', valor: formatar(d.mc_ganho), rotulo: 'Moedas Verdes ganhas',
          nota: periodo.nota },
    ]
}

/* ---------- Evolução de XP (12 semanas) ---------- */
export function montarEvolucao(semanas = []) {
    const lista = semanas.map((s) => ({ semana: s.semana, xp: Number(s.xp) || 0 }))
    const maior = Math.max(1, ...lista.map((s) => s.xp))
    const ultimo = lista.at(-1)?.xp ?? 0
    const anterior = lista.at(-2)?.xp ?? 0

    // sem XP na semana anterior não existe porcentagem: mostra o ganho da semana
    let variacao
    if (anterior > 0) {
        const v = ((ultimo - anterior) / anterior) * 100
        variacao = `${v >= 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')}%`
    } else {
        variacao = ultimo > 0 ? `+${formatar(ultimo)} XP` : '—'
    }

    return {
        semanas: lista.map((s) => ({ ...s, altura: s.xp > 0 ? Math.max(3, Math.round((s.xp / maior) * 100)) : 0 })),
        variacao,
        temDados: lista.some((s) => s.xp > 0),
    }
}

/* ---------- Conquistas ---------- */
const ICONES = ['raio', 'historico', 'usuarios', 'alvo', 'trofeu', 'folha']
const TONS = ['laranja', 'verde', 'azul']

export function montarConquistas(c = { total: 0, desbloqueadas: 0, lista: [] }) {
    return {
        total: c.total,
        desbloqueadas: c.desbloqueadas,
        // as 4 mais recentes (a API manda as desbloqueadas primeiro, da mais nova para a mais antiga)
        lista: c.lista.slice(0, 4).map((x, i) => ({
            id: x.id,
            titulo: x.nome,
            descricao: x.descricao,
            icone: ICONES[i % ICONES.length],
            desbloqueada: x.desbloqueada,
            tom: x.desbloqueada ? TONS[i % TONS.length] : 'cinza',
        })),
    }
}

/* ---------- Missões da tela ---------- */
const STATUS = { EM_ANDAMENTO: 'andamento', CONCLUIDA: 'concluida' }

export function rotuloPrazoMissao(dias) {
    if (dias == null) return ''
    if (dias <= 0) return 'Hoje'
    return dias === 1 ? '1 dia' : `${dias} dias`
}

export async function listarMissoesDoPerfil() {
    let linhas
    try {
        linhas = await listarMissoes('todas')
    } catch (erro) {
        if (erro.status === 404) return [] // ainda não há missões cadastradas
        throw erro
    }
    return linhas.map((m) => ({
        id: m.id_missao,
        titulo: m.nome_missao,
        resumo: m.descricao_missao ?? '',
        categoria: (m.categoria ?? [])[0]?.nome_categoria ?? '',
        dificuldade: m.nome_dificuldade ?? '',
        mc: Number(m.coins_missao) || 0,
        xp: Number(m.xp_missao) || 0,
        prazo: m.prazo_dias ?? null,
        status: STATUS[m.status_missao] ?? 'disponivel',
        progresso: Math.min(100, Math.max(0, Number(m.progresso_missao) || 0)),
    }))
}
