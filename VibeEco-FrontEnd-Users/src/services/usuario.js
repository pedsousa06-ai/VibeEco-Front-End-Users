// Dados simulados do usuário logado, compartilhados entre o layout (barra do topo e menu)
// e as telas. Quando houver API, preencha este objeto com a resposta do back-end.
import { reactive } from 'vue'

export const usuario = reactive({
  nome: 'Maria Alves',
  email: "ana@vibeeco.com",
  foto: "/Maria.png",
  iniciais: 'MA',
  nivel: 'Nível 7 - Guardião',
  xp: 2450,
  xpProximoNivel: 3000,
  mc: 480,
  ofensiva: 9,
  notificacoes: 10,
})
