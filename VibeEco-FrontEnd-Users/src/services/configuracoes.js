import { reactive, watch } from "vue";
import '@/assets/acessibilidade.css'

// Preferências da tela de Configurações.
// Por enquanto ficam só neste navegador (localStorage). Quando houver endpoint no back-end,
// troque a leitura/gravação abaixo por chamadas à API.
const CHAVE = 'vebeeco:configuracoes'

const PADRAO = {
    idioma: 'pt-BR',
    altoContraste: false,
    tamanhoFonte: 'medio', // 'pequeno' | 'medio(padrão)' | 'grande'
    animacoes: true,
     // privacidade
     aparecerNoRanking: true,
     atividadesVisiveis: false,
     perfilPublico: true,
     tema: 'claro', // 'claro' | 'escuro'
}

const ESCALA = { pequeno: 0.9, medio: 1, grande: 1.12}

function ler(){
    try {
        return { ...PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE)) ?? {}) }
    } catch {
        return {...PADRAO}
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
watch(
    configuracoes,
    () => {
        aplicar()
        try{
            localStorage.setItem(CHAVE, JSON.stringify(configuracoes))
        } catch {
            /* Por enquanto segue sem armazenamento disponivel */
        }
    },
    { deep: true },
)
