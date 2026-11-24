// O id do usuário logado vem do token (JWT) guardado em services/auth.js.
// Em desenvolvimento, sem login, ainda dá para usar VITE_DEV_USER_ID do .env.
import { dadosDoToken } from './auth'

export function idDoUsuario() {
    const id = Number(dadosDoToken()?.sub)
    if (Number.isInteger(id) && id > 0) return id

    if (import.meta.env.DEV) {
        const dev = Number(import.meta.env.VITE_DEV_USER_ID)
        if (Number.isInteger(dev) && dev > 0) return dev
    }
    throw new Error('Sessão inválida.')
}
