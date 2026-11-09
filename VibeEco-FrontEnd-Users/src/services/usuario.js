// Dados simulados do usuário logado, compartilhados entre o layout (barra do topo e menu)
// e as telas. Quando houver API, preencha este objeto com a resposta do back-end.
import { reactive } from 'vue'

export const usuario = reactive({
  id: 2,
  nome: 'Ana Silva',
  email: 'ana@vibeeco.com',
  senha: 'senha_hash_456',
  foto:  'https://exemplo.com/fotos/ana.jpg',
  iniciais: 'AS',
  nivel: 'Nível 7 - Guardião',
  xp: 2450,
  xpProximoNivel: 3000,
  mc: 480,
  ofensiva: 9,
  notificacoes: 10,
  matricula: '2021012345',
  nomePublico: 'ana.silva',
  curso: 'Engenharia Ambiental',
  instituicao: 'Universidade Federal de Minas Gerais',
  localizacao: 'Belo Horizonte, MG',
  desde: 'março de 2024',
  bio: 'Estudante, voluntária e apaixonada por transformar pequenos hábitos em impacto coletivo.',
})
