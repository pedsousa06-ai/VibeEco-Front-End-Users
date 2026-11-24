import { reactive, watch } from "vue";
import '@/assets/acessibilidade.css';
import { usuario } from './usuario'; 
import { comAuth } from './api'
import '@/assets/tema.css'

const CHAVE = 'vebeeco:configuracoes'
const API_URL = 'http://localhost:8080/v1/senai/vibeEco' // URL do seu back-end

const PADRAO = {
    idioma: 'pt-BR',
    altoContraste: false,
    tamanhoFonte: 'medio',
    animacoes: true,
    aparecerNoRanking: true,
    atividadesVisiveis: false,
    perfilPublico: true,
    tema: 'claro',
}

const ESCALA = { pequeno: 0.9, medio: 1, grande: 1.12 }

function ler() {
    try {
        return { ...PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE)) ?? {}) }
    } catch {
        return { ...PADRAO }
    }
}

export const configuracoes = reactive(ler())

function aplicar() {
    const raiz = document.documentElement
    raiz.lang = configuracoes.idioma
    raiz.dataset.contraste = configuracoes.altoContraste ? 'alto' : 'normal'
    raiz.dataset.animacoes = configuracoes.animacoes ? 'on' : 'off'
    raiz.style.zoom = String(ESCALA[configuracoes.tamanhoFonte] ?? 1)
    raiz.dataset.tema = configuracoes.tema === 'escuro' ? 'escuro' : 'claro'
}

aplicar()

// ============================================================================
// INTEGRAÇÃO COM O BACK-END (USANDO FETCH NATIVO)
// ============================================================================

export async function carregarConfiguracoes(idUsuario) {
    if (!idUsuario) return;
    
    try {
        const response = await fetch(`${API_URL}/configuracoes/${idUsuario}`, comAuth())
        
        if (!response.ok) throw new Error('Erro na requisição')
        
        const data = await response.json()
        
        Object.assign(configuracoes, data)
        localStorage.setItem(CHAVE, JSON.stringify(configuracoes))
        aplicar()
    } catch (error) {
        console.error('Erro ao buscar configurações do banco:', error)
    }
}

let timeoutSalvar

watch(
    configuracoes,
    () => {
        aplicar()
        try {
            localStorage.setItem(CHAVE, JSON.stringify(configuracoes))
        } catch { /* ignora */ }

        const idUsuario = usuario.value?.id || usuario?.id 
        
        if (idUsuario) {
            clearTimeout(timeoutSalvar)
            timeoutSalvar = setTimeout(async () => {
                try {
                    await fetch(`${API_URL}/configuracoes/${idUsuario}`, comAuth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(configuracoes)
                    }))
                    console.log('Configurações salvas no banco!')
                } catch (error) {
                    console.error('Erro ao salvar configurações no banco:', error)
                }
            }, 800)
        }
    },
    { deep: true },
)