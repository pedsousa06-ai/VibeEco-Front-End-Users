import { reactive } from 'vue'

export const CATEGORIAS = {
  agua: { rotulo: 'Água', cor: '#0ea5e9' },
  mobilidade: { rotulo: 'Mobilidade', cor: '#22c55e' },
  biodiversidade: { rotulo: 'Biodiversidade', cor: '#166534' },
  alimentacao: { rotulo: 'Alimentação', cor: '#d97706' },
  energia: { rotulo: 'Energia', cor: '#7c3aed' },
}

export const DIFICULDADES = {
  facil: { rotulo: 'Fácil', fundo: '#e3f5ea', texto: '#15803d' },
  medio: { rotulo: 'Médio', fundo: '#fff1e0', texto: '#c2610c' },
  dificil: { rotulo: 'Difícil', fundo: '#fde8e8', texto: '#c81e1e' },
}

export const ESCOPOS = {
  individual: 'Individual',
  coletivo: 'Coletivo',
}

function tarefas(...lista) {
  return lista.map(([titulo, descricao, feita = false], i) => ({
    id: i + 1,
    titulo,
    descricao,
    feita,
  }))
}

export const desafios = reactive([
  {
    id: 1,
    titulo: 'Desafio da Água',
    descricao:
      'Reduza o consumo de água da sua instituição em 20% durante uma semana. Monitoramento feito por medidores instalados.',
    categoria: 'agua',
    escopo: 'coletivo',
    dificuldade: 'medio',
    participantes: 412,
    meta: 500,
    xp: 300,
    mc: 75,
    dias: 1,
    participando: true,
    tarefas: tarefas(
      ['Fazer a leitura inicial do medidor', 'Anote o valor do medidor antes de começar.', true],
      ['Avisar a turma sobre a meta', 'Compartilhe a meta de 20% com seus colegas.', true],
      ['Fechar as torneiras ao ensaboar as mãos', 'Mantenha o hábito durante toda a semana.', true],
      ['Registrar a leitura final', 'Compare com a leitura inicial e envie o resultado.'],
    ),
  },
  {
    id: 2,
    titulo: 'Semana sem Carro',
    descricao:
      'Use apenas transporte público, bicicleta ou vá a pé por 7 dias consecutivos. Registre cada deslocamento.',
    categoria: 'mobilidade',
    escopo: 'individual',
    dificuldade: 'dificil',
    participantes: 234,
    meta: 400,
    xp: 500,
    mc: 120,
    dias: 4,
    participando: false,
    tarefas: tarefas(
      ['Planejar suas rotas da semana', 'Escolha o meio de transporte de cada trajeto.'],
      ['Registrar os deslocamentos dos 3 primeiros dias', 'Anote o trajeto e o meio usado.'],
      ['Registrar os deslocamentos dos 4 últimos dias', 'Continue anotando até completar 7 dias.'],
      ['Enviar o relato final', 'Conte como foi a experiência e quantos km você evitou de carro.'],
    ),
  },
  {
    id: 3,
    titulo: 'Adote uma Área Verde',
    descricao:
      'Escolha uma área verde próxima e comprometa-se a cuidar dela durante 30 dias: limpeza, plantio e manutenção.',
    categoria: 'biodiversidade',
    escopo: 'coletivo',
    dificuldade: 'medio',
    participantes: 156,
    meta: 200,
    xp: 400,
    mc: 90,
    dias: 8,
    participando: false,
    tarefas: tarefas(
      ['Escolher a área e fotografar o estado inicial', 'Tire fotos de vários ângulos.'],
      ['Fazer a primeira limpeza', 'Recolha o lixo e separe o que for reciclável.'],
      ['Plantar ao menos 3 mudas', 'Prefira espécies nativas da sua região.'],
      ['Fazer a manutenção semanal', 'Regue, pode e retire o lixo que aparecer.'],
      ['Enviar fotos do resultado final', 'Mostre o antes e o depois.'],
    ),
  },
  {
    id: 4,
    titulo: 'Zero Resíduo na Lancheira',
    descricao: 'Passe uma semana inteira sem gerar lixo não reciclável no almoço. Documente com fotos diárias.',
    categoria: 'alimentacao',
    escopo: 'individual',
    dificuldade: 'facil',
    participantes: 89,
    meta: 150,
    xp: 200,
    mc: 45,
    dias: 12,
    participando: false,
    tarefas: tarefas(
      ['Trocar embalagens descartáveis por reutilizáveis', 'Potes, garrafa e talheres que podem ser lavados.'],
      ['Montar a lancheira sem plástico descartável', 'Fotografe a lancheira pronta.'],
      ['Completar 5 dias seguidos', 'Envie uma foto por dia.'],
    ),
  },
  {
    id: 5,
    titulo: 'Energia Limpa em Casa',
    descricao: 'Reduza o consumo de energia da sua residência em 15% comparando com o mês anterior.',
    categoria: 'energia',
    escopo: 'coletivo',
    dificuldade: 'dificil',
    participantes: 178,
    meta: 300,
    xp: 350,
    mc: 80,
    dias: 20,
    participando: false,
    tarefas: tarefas(
      ['Anotar o consumo do mês anterior', 'Está na sua conta de energia.'],
      ['Trocar lâmpadas por LED', 'Comece pelos cômodos mais usados.'],
      ['Desligar aparelhos da tomada', 'Evite o modo espera à noite.'],
      ['Comparar a nova conta', 'Envie a comparação para validar a redução.'],
    ),
  },
  {
    id: 6,
    titulo: 'Horta Vertical Sustentável',
    descricao: 'Monte e mantenha uma horta vertical com pelo menos 5 espécies de plantas comestíveis.',
    categoria: 'alimentacao',
    escopo: 'individual',
    dificuldade: 'medio',
    participantes: 67,
    meta: 100,
    xp: 280,
    mc: 60,
    dias: 30,
    participando: false,
    tarefas: tarefas(
      ['Montar a estrutura da horta', 'Pode usar pallets, garrafas PET ou prateleiras.'],
      ['Plantar 5 espécies diferentes', 'Temperos e hortaliças pequenas são boas opções.'],
      ['Regar e cuidar por 2 semanas', 'Registre o crescimento com fotos.'],
      ['Fazer a primeira colheita', 'Mostre o que você colheu.'],
    ),
  },
])

export function buscarDesafio(id) {
  return desafios.find((d) => d.id === Number(id))
}

export function progressoDe(desafio) {
  if (!desafio.tarefas.length) return 0
  const feitas = desafio.tarefas.filter((t) => t.feita).length
  return Math.round((feitas / desafio.tarefas.length) * 100)
}

export function tarefasFeitas(desafio) {
  return desafio.tarefas.filter((t) => t.feita).length
}

export function concluido(desafio) {
  return desafio.tarefas.length > 0 && desafio.tarefas.every((t) => t.feita)
}

export function participar(desafio) {
  if (desafio.participando) return
  desafio.participando = true
  desafio.participantes += 1
}

export function abandonar(desafio) {
  if (!desafio.participando) return
  desafio.participando = false
  desafio.participantes = Math.max(0, desafio.participantes - 1)
  desafio.tarefas.forEach((t) => (t.feita = false))
}

export function alternarTarefa(desafio, tarefa) {
  if (!desafio.participando) return
  tarefa.feita = !tarefa.feita
}

export function rotuloDias(dias) {
  return dias === 1 ? '1 dia' : `${dias} dias`
}
