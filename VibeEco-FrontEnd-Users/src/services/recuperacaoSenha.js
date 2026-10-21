// Guarda em que etapa da recuperação de senha o usuário está, para as telas
// "Insira o código" e "Nova senha" só abrirem depois das etapas anteriores.
// Fica no sessionStorage: sobrevive ao F5, mas some ao fechar a aba.
import { reactive } from 'vue'

const CHAVE = 'vibeeco_recuperacao'
const inicial = { email: '', codigoVerificado: false }

function carregar() {
  try {
    return { ...inicial, ...JSON.parse(sessionStorage.getItem(CHAVE)) }
  } catch {
    return { ...inicial }
  }
}

export const recuperacao = reactive(carregar())

function salvar() {
  sessionStorage.setItem(CHAVE, JSON.stringify(recuperacao))
}

// Etapa 1: chame quando o e-mail for enviado na tela "Esqueci minha senha"
export function iniciarRecuperacao(email) {
  recuperacao.email = email.trim()
  recuperacao.codigoVerificado = false
  salvar()
}

// Etapa 2: chame quando o código for confirmado
export function marcarCodigoVerificado() {
  recuperacao.codigoVerificado = true
  salvar()
}

// Fim (ou cancelamento) do fluxo
export function limparRecuperacao() {
  recuperacao.email = ''
  recuperacao.codigoVerificado = false
  sessionStorage.removeItem(CHAVE)
}
