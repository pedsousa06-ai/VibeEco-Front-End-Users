import { conteudos } from "@/data/Conteudos";

// No futuro quando o back-end existir, trocar o corpo das funções
// por chamadas na API.
const CHAVE = 'vibeeco:conteudos-progresso'
const APROVEITAMENTO_MINIMO = 0.6 // 60% de acertos para concluir o quiz.

export const CATEGORIAS = ['Água', 'Reciclagem', 'Energia', 
    'Alimentação', 'Biodiversidade', 'Mobilidade']

const DEGRADE_CATEGORIA = {
    Água: ['#2b7a9b', '#1d4f6b'],
  Reciclagem: ['#5b8c5a', '#2f5d3a'],
  Energia: ['#e0a030', '#a85f1c'],
  Alimentação: ['#c8503c', '#8a2f2a'],
  Biodiversidade: ['#3f7d4e', '#1f4d2e'],
  Mobilidade: ['#6b7a8f', '#3a4556'],
}

function lerProgresso (){
    try{
        return JSON.parse(localStorage.getItem(CHAVE)) ?? {}
    } catch {
        return {}
    }
}

function salvarProgresso (progresso){
    try {
        localStorage.setItem(CHAVE, JSON.stringify(progresso))
    } catch {
        /* Por enquanto sem armazenamento disponível para ser salvo  */
    }
}

// Se a imagem não existir, aparece um degradê da categoria em baixo.
export function estiloCapa(conteudo){
    const [a, b] = DEGRADE_CATEGORIA[conteudo.categoria] ?? ['#5b8c5a','#2f5d3a']
    return {
        backgroundImage: `url(${conteudo.imagem}), linear-gradient(135deg, ${a}, ${b})` 
    }
}

export async function listarConteudos(){
    const progresso = lerProgresso()
    return conteudos.map((c)=> ({ ...c, concluido: Boolean(progresso[c.id]?.concluido) }))
}

export async function obterConteudo(id){
    const conteudo = conteudos.find((c)=> c.id === id)
    if (!conteudo) return null
    
    return { ...conteudo, concluido: Boolean(lerProgresso()[id]?.concluido)}
}

// Registra o resultado do quiz e devolve { aprovado, acertos, total, xpGanho }.
// O XP só é dado na primeira conclusão, proporcional aos acertos.
// Importante: quando houver back-end, é ele quem deve calcular e creditar o XP

export async function concluirConteudo(id, acertos, total) {
    const conteudo = conteudos.find((c) => c.id === id)
    const progresso = lerProgresso() 
    const jaConcluido = Boolean(progresso[id]?.concluido)
    const aprovado = acertos / total >= APROVEITAMENTO_MINIMO
    
    const melhor = Math.max(acertos, progresso[id]?.melhorResultado ?? 0)
    progresso[id] = { concluido: jaConcluido || aprovado, melhorResultado : melhor}
    salvarProgresso(progresso)

    const xpGanho = aprovado && !jaConcluido ? Math.round((conteudo.xp * acertos) / total) : 0
    return { aprovado, acertos, total, xpGanho}
}
