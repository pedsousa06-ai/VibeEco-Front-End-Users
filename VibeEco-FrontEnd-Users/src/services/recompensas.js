import { computed, reactive } from 'vue'
import { usuario } from '@/services/usuario'

// TODO: trocar os dados mockados por chamadas à API

// Pega o número do nível a partir de "Nível 7 — Guardião".
// Se o seu `usuario` já tiver um campo numérico (ex.: usuario.nivelNumero), use ele aqui.
export function nivelDoUsuario() {
  const numero = parseInt(String(usuario.nivel).match(/\d+/)?.[0], 10)
  return Number.isFinite(numero) ? numero : 1
}

// `imagem`: caminho de uma foto (ex.: '/recompensas/garrafa.jpg').
// Sem imagem, o card usa um fundo em gradiente com o emoji.
// `estoque: null` significa ilimitado.
export const recompensasLista = reactive([
  { id: 1, titulo: 'Garrafa Sustentável VibeEco', tipo: 'Produto', preco: 150, nivelMinimo: 5, estoque: 12, emoji: '🧴', tema: 'verde', imagem: null },
  { id: 2, titulo: 'Desconto em Loja Ecológica', tipo: 'Desconto', preco: 200, nivelMinimo: 7, estoque: null, emoji: '🏷️', tema: 'laranja', imagem: null },
  { id: 3, titulo: 'Kit Sementes Orgânicas', tipo: 'Produto', preco: 120, nivelMinimo: 4, estoque: 0, emoji: '🌱', tema: 'terra', imagem: null },
  { id: 4, titulo: 'Aula de Permacultura', tipo: 'Experiência', preco: 250, nivelMinimo: 8, estoque: 5, emoji: '🌾', tema: 'azul', imagem: null },
  { id: 5, titulo: 'Planta Nativa + Entrega', tipo: 'Produto', preco: 180, nivelMinimo: 6, estoque: 8, emoji: '🪴', tema: 'verde', imagem: null },
])

// Mais recente primeiro
export const resgates = reactive([
  {
    id: 1,
    nome: 'Kit de Adesivos Eco',
    tipo: 'Produto',
    preco: 80,
    emoji: '✨',
    tema: 'laranja',
    imagem: null,
    data: '2026-10-22T14:30:00',
    codigo: 'VIBE-7K2M9Q',
  },
])

export const totalResgatado = computed(() => resgates.reduce((soma, r) => soma + r.preco, 0))

// 'disponivel' | 'nivel' | 'saldo' | 'esgotado'
export function estadoDe(recompensa) {
  if (recompensa.estoque === 0) return 'esgotado'
  if (nivelDoUsuario() < recompensa.nivelMinimo) return 'nivel'
  if (usuario.mc < recompensa.preco) return 'saldo'
  return 'disponivel'
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function gerarCodigo() {
  let sufixo = ''
  for (let i = 0; i < 6; i++) sufixo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  return `VIBE-${sufixo}`
}

// Retorna { ok: true, resgate } ou { ok: false, motivo }
export function resgatar(id) {
  const recompensa = recompensasLista.find((r) => r.id === id)
  if (!recompensa) return { ok: false, motivo: 'Recompensa não encontrada.' }

  const estado = estadoDe(recompensa)
  if (estado === 'esgotado') return { ok: false, motivo: 'Essa recompensa acabou de esgotar.' }
  if (estado === 'nivel') return { ok: false, motivo: 'Seu nível ainda não permite este resgate.' }
  if (estado === 'saldo') return { ok: false, motivo: 'Saldo de Moedas Verdes insuficiente.' }

  usuario.mc -= recompensa.preco
  if (recompensa.estoque !== null) recompensa.estoque -= 1

  const resgate = {
    id: Date.now(),
    nome: recompensa.titulo,
    tipo: recompensa.tipo,
    preco: recompensa.preco,
    emoji: recompensa.emoji,
    tema: recompensa.tema,
    imagem: recompensa.imagem,
    data: new Date().toISOString(),
    codigo: gerarCodigo(),
  }
  resgates.unshift(resgate)
  return { ok: true, resgate }
}
