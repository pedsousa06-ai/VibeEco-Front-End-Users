import { ref, computed } from 'vue'

const API_URL = 'http://localhost:8080/v1/senai/vibeEco'

// Ref reativa que vai guardar as atividades vindas do banco
export const atividades = ref([])

// O resumo agora é dinâmico: conta quantos itens de cada tipo existem no array de atividades
export const resumoHistorico = computed(() => {
    return [
        { numero: atividades.value.filter(a => a.tipo === 'missao').length, rotulo: 'Missões concluídas', cor: '#16a34a' },
        { numero: atividades.value.filter(a => a.tipo === 'conteudo').length, rotulo: 'Conteúdos consumidos', cor: '#0ea5e9' },
        { numero: atividades.value.filter(a => a.tipo === 'desafio').length, rotulo: 'Desafios realizados', cor: '#7c3aed' },
        { numero: atividades.value.filter(a => a.tipo === 'conquista').length, rotulo: 'Conquistas totais', cor: '#d4a106' },
    ]
})

export async function carregarHistorico(idUsuario) {
    if (!idUsuario) return

    try {
        const response = await fetch(`${API_URL}/historico/${idUsuario}`)
        if (!response.ok) throw new Error('Erro ao buscar histórico')

        const data = await response.json()
        atividades.value = data.atividades // Preenche a ref com os dados do back-end
    } catch (error) {
        console.error('Erro ao carregar histórico:', error)
    }
}