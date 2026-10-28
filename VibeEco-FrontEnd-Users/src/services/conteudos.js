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
    
}