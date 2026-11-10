export const PERIODOS = [
    { valor: '7', rotulo: '7 dias'},
    { valor: '30', rotulo: '30 dias'},
    { valor: 'todo', rotulo: 'Todo período'},
]

// TODO: trocar por chamadas da API quando existir os endpoints
const DADOS = {
    7: { xp: 2450, xpNota: '+90 nos últimos 7 dias', ranking: 18, rankingNota: 'Subiu 2 posições', missoes: 9, missoesNota: '3 missões esta semana', co2: 62 },
    30: { xp: 2450, xpNota: '+320 nos últimos 30 dias', ranking: 18, rankingNota: 'Entre 1.284 participantes', missoes: 34, missoesNota: '8 missões este mês', co2: 186 },
    todo: { xp: 2450, xpNota: '+2.450 desde o início', ranking: 18, rankingNota: 'Entre 1.284 participantes', missoes: 52, missoesNota: '52 desde março de 2024', co2: 410 },
}

export function obterDesempenho(periodo) {
    const d = DADOS[periodo]
    return [
        { id: 'xp', icone: 'estrelaC', valor: d.xp.toLocaleString('pt-BR'), rotulo: 'XP acumulado', nota: d.xpNota },
        { id: 'ranking', icone: 'trofeu', valor: `#${d.ranking}`, rotulo: 'Posição no ranking', nota: d.rankingNota },
        { id: 'missoes', icone: 'checkC', valor: String(d.missoes), rotulo: 'Missões concluídas', nota: d.missoesNota },
        { id: 'co2', icone: 'folha', valor: `${d.co2} kg`, rotulo: 'Impacto estimado', nota: 'de CO₂ evitados' },
    ]
}

// XP conquistado em cada um das ultimas 12 semanas
const SEMANAS_XP = [120, 180, 150, 260, 220, 320, 250, 400, 300, 420, 380, 450]

export function obterEvolucaoXp() {
    const maior = Math.max(...SEMANAS_XP)
    const ultimo = SEMANAS_XP.at(-1)
    const anterior = SEMANAS_XP.at(-2)
    const variacao = ((ultimo - anterior) / anterior) * 100

    return {
        semanas: SEMANAS_XP.map((xp, i) => ({
            semana: i + 1,
            xp,
            altura: Math.round((xp / maior) * 100),
        })),
        variacao: `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1).replace('.', ',')}%`,
    }
}

export const TOTAL_EMBLEMA = 12

export const CONQUISTAS = [
    { id: 'sequencia', titulo: 'Sequência verde', descricao: '30 dias ativos', icone: 'raio', desbloqueada: true },
    { id: 'reciclador', titulo: 'Reciclador mestre', descricao: '25 ações registradas', icone: 'historico', desbloqueada: true },
    { id: 'mobilizador', titulo: 'Mobilizador', descricao: 'Convidou 5 pessoas', icone: 'usuarios', desbloqueada: true },
    { id: 'floresta', titulo: 'Guardião da floresta', descricao: '78% concluído', icone: 'alvo', desbloqueada: false },
]