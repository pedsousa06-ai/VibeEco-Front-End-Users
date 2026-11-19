import { ref, computed } from 'vue'

const API_URL = 'http://localhost:8080/v1/senai/vibeEco'

export const notificacoes = ref([])
export const naoLidas = computed(() => notificacoes.value.filter(n => !n.lida).length)

export async function carregarNotificacoes(idUsuario) {
    try {
        const response = await fetch(`${API_URL}/notificacoes/${idUsuario}`)
        if (!response.ok) throw new Error('Erro ao buscar')
        const data = await response.json()
        notificacoes.value = data
    } catch (e) {
        console.error('Erro ao carregar notificações:', e)
    }
}

export async function marcarComoLida(id) {
    try {
        await fetch(`${API_URL}/notificacoes/${id}/lida`, { method: 'PUT' })
        const n = notificacoes.value.find(n => n.id === id)
        if (n) n.lida = true
    } catch (e) {
        console.error(e)
    }
}

export async function marcarTodasComoLidas(idUsuario) {
    try {
        await fetch(`${API_URL}/notificacoes/${idUsuario}/todas-lidas`, { method: 'PUT' })
        notificacoes.value.forEach(n => n.lida = true)
    } catch (e) {
        console.error(e)
    }
}

export function tempoRelativo(minutos) {
  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `${minutos} min atrás`
  if (minutos < 1440) return `${Math.floor(minutos / 60)}h atrás`
  return `${Math.floor(minutos / 1440)}d atrás`
}