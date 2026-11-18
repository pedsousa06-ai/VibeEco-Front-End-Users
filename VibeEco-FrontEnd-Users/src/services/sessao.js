// TENPORÁRIO: sem login, o id vem do .env e ó em desenvolvimento.
// Quando o login funcionar. só este arquivo muda (o id passa a vir do token).
export function idDoUsuario() {
    if (import.meta.env.DEV) {
        const id = Number(import.meta.env.VITE_DEV_USER_ID)
        if (Number.isInteger(id) && id > 0) return id
    }
    throw new Error('Sessão inválida.')
}