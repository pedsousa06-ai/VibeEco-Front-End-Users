function chaveDia(texto) {
    const[dia, mes, ano] = texto.split(' ')[0].split('/')
    return `${ano}-${mes}-${dia}`
}


function chaveDeData(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
}

function diasCumpridos(registros) {
    return new Set(
        registros
            .filter((r) => r.status_ofensiva === 1)
            .map((r) => chaveDia(r.data_ofensiva))
    )
}

export function calcularSequencia(registros) {
    const dias = diasCumpridos(registros)
    const cursor = new Date()

    // Hoje ainda não cumprido: a sequência continua viva a partir de ontem
    if (!dias.has(chaveDeData(cursor))) cursor.setDate(cursor.getDate() -1)
    
    let total = 0
    while (dias.has(chaveDeData(cursor))) {
        total++
        cursor.setDate(cursor.getDate() -1)
    }
    return total
}

export function semanaAtual(registros) {
    const dias = diasCumpridos(registros)
    const hoje = new Date()
    const segunda = new Date(hoje)
    segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7))

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(segunda)
        d.setDate(segunda.getDate() + i)
        return dias.has(chaveDeData(d))
    })
}