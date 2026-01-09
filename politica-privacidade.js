// Função para obter preço por folha baseado na quantidade
function obterPrecoPorFolha(tipo, folhas) {
    // Para colorida-frente
    if (tipo === 'colorida-frente') {
        if (folhas <= 100) {
            return 0.80; // R$ 0,80 até 100 folhas
        } else if (folhas <= 300) {
            return 0.70; // R$ 0,70 até 300 folhas
        } else {
            return 0.60; // R$ 0,60 acima de 300 folhas
        }
    }
    
    // Para colorida-frente e verso
    if (tipo === 'colorida-fv') {
        if (folhas <= 100) {
            return 1.60; // Dobro de 0,80
        } else if (folhas <= 300) {
            return 1.40; // Dobro de 0,70
        } else {
            return 1.20; // Dobro de 0,60
        }
    }
    
    // Para preta-frente (mantendo preços anteriores)
    if (tipo === 'preta-frente') {
        return 0.55; // Mantido o preço anterior
    }
    
    // Para preta-frente e verso - NOVO PREÇO ACIMA DE 160 FOLHAS
    if (tipo === 'preta-fv') {
        if (folhas > 160) {
            return 0.48; // R$ 0,24 por impressão × 2 = R$ 0,48 por folha
        } else {
            return 0.80; // Preço normal para até 160 folhas
        }
    }
    
    // Valor padrão (não deve acontecer)
    return 0.80;
}