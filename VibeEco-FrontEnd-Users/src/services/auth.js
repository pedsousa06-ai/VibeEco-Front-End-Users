// Sessão do usuário integrada à API (POST /auth/login devolve um JWT).
// O token fica no localStorage ("lembrar") ou no sessionStorage (vale até fechar a aba).
import { apiEnviar } from './api'

const CHAVE = 'vibeeco_user_token'

export function obterToken() {
  return localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE)
}

// Lê o conteúdo (payload) do JWT sem validar a assinatura: quem valida é a API.
export function dadosDoToken(token = obterToken()) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(base64))))
  } catch {
    return null
  }
}

// logado = tem token e ele ainda não expirou
export function estaLogado() {
  const dados = dadosDoToken()
  if (!dados) return false
  if (dados.exp && dados.exp * 1000 <= Date.now()) {
    sair()
    return false
  }
  return true
}

const MENSAGENS = {
  CREDENCIAIS_INVALIDAS: 'E-mail, matrícula ou senha incorretos.',
  USUARIO_INATIVO: 'Seu usuário está inativo. Procure o administrador.',
  MUITAS_TENTATIVAS: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  DADOS_INVALIDOS: 'Confira os dados informados.',
  SENHA_FRACA: 'A senha precisa ter 8 caracteres ou mais, com letras e números.',
  SENHA_IGUAL: 'A nova senha precisa ser diferente da atual.',
  CODIGO_INVALIDO: 'Código inválido. Confira os 6 dígitos.',
  CODIGO_EXPIRADO: 'Código expirado. Peça um novo.',
  TOKEN_INVALIDO: 'Sua solicitação expirou. Refaça a recuperação de senha.',
}

// Texto amigável para um erro da API (a tela nunca mostra o texto cru do servidor)
export function mensagemDeErroAuth(erro, padrao = 'Não foi possível concluir. Tente novamente.') {
  if (erro?.codigo && MENSAGENS[erro.codigo]) return MENSAGENS[erro.codigo]
  if (erro instanceof TypeError) return 'Não foi possível conectar à API. Confira se ela está rodando.'
  return padrao
}

// "lembrar" = true guarda a sessão no navegador; false vale só até fechar a aba.
export async function entrar(login, senha, lembrar = false) {
  if (!login?.trim() || !senha) throw new Error('Informe seu e-mail ou matrícula e a senha.')

  let dados
  try {
    dados = await apiEnviar('POST', '/auth/login', { login: login.trim(), senha })
  } catch (e) {
    throw new Error(mensagemDeErroAuth(e, 'Não foi possível entrar. Tente novamente.'))
  }

  sair() // limpa token antigo nos dois lugares
  const armazenamento = lembrar ? localStorage : sessionStorage
  armazenamento.setItem(CHAVE, dados.response.token)
}

export function sair() {
  localStorage.removeItem(CHAVE)
  sessionStorage.removeItem(CHAVE)
}

/* ---------- Recuperação de senha e primeiro acesso (rotas públicas) ---------- */
export const pedirCodigoRecuperacao = (email) => apiEnviar('POST', '/auth/recuperarAcesso', { email })

// devolve o token curto que autoriza a troca de senha
export async function validarCodigoRecuperacao(email, codigo) {
  const dados = await apiEnviar('POST', '/auth/validarCodigo', { email, codigo })
  return dados.response.token
}

export const redefinirSenhaComToken = (token, novaSenha) =>
  apiEnviar('POST', '/auth/redefinirSenha', { token, novaSenha })

export const criarSenhaPrimeiroAcesso = (login, senhaAtual, novaSenha) =>
  apiEnviar('POST', '/auth/primeiroAcesso', { login, senhaAtual, novaSenha })
