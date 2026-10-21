// Sessão simulada, sem API. Quando o back-end existir, troque o corpo destas
// funções por chamadas reais e mantenha os mesmos nomes.
const CHAVE = 'vibeeco_user_token'

export function estaLogado() {
  return !!(localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE))
}

// TODO: trocar por POST /login. Por enquanto aceita qualquer login e senha preenchidos.
// "lembrar" = true guarda a sessão no navegador; false vale só até fechar a aba.
export async function entrar(login, senha, lembrar = false) {
  if (!login?.trim() || !senha) throw new Error('Informe seu e-mail ou matrícula e a senha.')
  const armazenamento = lembrar ? localStorage : sessionStorage
  armazenamento.setItem(CHAVE, 'token-simulado')
}

export function sair() {
  localStorage.removeItem(CHAVE)
  sessionStorage.removeItem(CHAVE)
}
