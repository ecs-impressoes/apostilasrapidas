// Fretes por cidade
const FRETES_POR_CIDADE = {
    'cubatão': 10.00,
    'santos': 20.00,
    'guarujá': 40.00,
    'praia grande': 28.00,
    'são vicente': 25.00
};

// Função para buscar endereço pelo CEP
async function buscarEnderecoPorCEP(cep) {
    const cepNumerico = cep.replace(/\D/g, '');
    
    if (cepNumerico.length !== 8) {
        return null;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            return null;
        }
        
        return {
            cep: data.cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
            complemento: data.complemento || ''
        };
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return null;
    }
}

// Validar formulário do cliente
function validarFormularioCliente() {
    const nome = document.getElementById('customer-name').value.trim();
    const telefone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const cep = document.getElementById('customer-cep').value.trim();
    const numero = document.getElementById('customer-number').value.trim();
    const rua = document.getElementById('customer-street').value.trim();
    const bairro = document.getElementById('customer-neighborhood').value.trim();
    const cidade = document.getElementById('customer-city').value.trim();
    const estado = document.getElementById('customer-state').value.trim();
    const deliveryMethod = document.getElementById('delivery-method').value;
    
    // Validações básicas
    if (!nome || nome.length < 3) return false;
    if (!telefone || telefone.replace(/\D/g, '').length < 10) return false;
    if (!email || !email.includes('@') || !email.includes('.')) return false;
    if (!cep || cep.replace(/\D/g, '').length !== 8) return false;
    if (!numero) return false;
    if (!rua) return false;
    if (!bairro) return false;
    if (!cidade) return false;
    if (!estado || estado.length !== 2) return false;
    if (!deliveryMethod) return false;
    
    return true;
}

// Função para buscar CEP
async function buscarCEP() {
    const cepInput = document.getElementById('customer-cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    // Mostrar loading
    document.getElementById('cep-loading').style.display = 'block';
    document.getElementById('cep-success').style.display = 'none';
    document.getElementById('cep-error').style.display = 'none';
    
    try {
        const endereco = await buscarEnderecoPorCEP(cep);
        
        if (endereco) {
            // Preencher campos automaticamente
            document.getElementById('customer-street').value = endereco.logradouro;
            document.getElementById('customer-neighborhood').value = endereco.bairro;
            document.getElementById('customer-city').value = endereco.cidade;
            document.getElementById('customer-state').value = endereco.estado;
            
            // Adicionar classe para indicar que foi preenchido automaticamente
            ['customer-street', 'customer-neighborhood', 'customer-city', 'customer-state'].forEach(id => {
                const campo = document.getElementById(id);
                campo.classList.add('address-autofilled');
                setTimeout(() => campo.classList.remove('address-autofilled'), 2000);
            });
            
            // Mostrar sucesso
            document.getElementById('cep-success').style.display = 'block';
            
            // Focar no campo número
            document.getElementById('customer-number').focus();
            
            // Calcular frete para a cidade
            calcularFreteParaCidade(endereco.cidade);
        } else {
            document.getElementById('cep-error').style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        document.getElementById('cep-error').style.display = 'block';
    } finally {
        document.getElementById('cep-loading').style.display = 'none';
    }
}

// Função para calcular frete baseado na cidade
function calcularFreteParaCidade(cidade) {
    const freteCalculoDiv = document.getElementById('frete-calculo');
    const cidadeNormalizada = cidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let valorFrete = 0;
    let cidadeEncontrada = cidade;
    
    // Verificar se a cidade está na lista de fretes fixos
    for (const [cidadeNome, valor] of Object.entries(FRETES_POR_CIDADE)) {
        const cidadeNomeNormalizada = cidadeNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (cidadeNormalizada.includes(cidadeNomeNormalizada) || 
            cidadeNomeNormalizada.includes(cidadeNormalizada)) {
            valorFrete = valor;
            cidadeEncontrada = cidadeNome.charAt(0).toUpperCase() + cidadeNome.slice(1);
            break;
        }
    }
    
    // Se não encontrou, usar valor padrão
    if (valorFrete === 0) {
        valorFrete = 30.00; // Frete padrão para cidades não listadas
    }
    
    // Atualizar a interface
    document.getElementById('cidade-texto').textContent = cidadeEncontrada;
    document.getElementById('valor-frete').textContent = 
        `R$ ${valorFrete.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    freteCalculoDiv.style.display = 'block';
    
    // Atualizar carrinho com o novo frete
    atualizarCarrinho();
}

// Validar telefone
function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    
    input.value = value;
}

// Validar CEP
function formatarCEP(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    
    input.value = value;
}

// Enviar pedido por WhatsApp
async function enviarPedidoWhatsApp() {
    if (!validarFormularioCliente()) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }
    
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio. Adicione apostilas antes de enviar o pedido.');
        return;
    }
    
    // Coletar dados do formulário
    const nome = document.getElementById('customer-name').value.trim();
    const telefone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const cep = document.getElementById('customer-cep').value.trim();
    const numero = document.getElementById('customer-number').value.trim();
    const rua = document.getElementById('customer-street').value.trim();
    const bairro = document.getElementById('customer-neighborhood').value.trim();
    const cidade = document.getElementById('customer-city').value.trim();
    const estado = document.getElementById('customer-state').value.trim();
    const complemento = document.getElementById('customer-complement').value.trim();
    const metodoEntrega = document.getElementById('delivery-method').value;
    const observacoes = document.getElementById('customer-notes').value.trim();
    
    // Calcular frete baseado na cidade
    let freteValor = 0;
    const cidadeNormalizada = cidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    for (const [cidadeNome, valor] of Object.entries(FRETES_POR_CIDADE)) {
        const cidadeNomeNormalizada = cidadeNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (cidadeNormalizada.includes(cidadeNomeNormalizada) || 
            cidadeNomeNormalizada.includes(cidadeNormalizada)) {
            freteValor = valor;
            break;
        }
    }
    
    // Se não encontrou, usar valor padrão
    if (freteValor === 0 && metodoEntrega === 'entrega') {
        freteValor = 30.00;
    }
    
    // Formatar mensagem para WhatsApp
    let mensagem = `*🛒 NOVO PEDIDO - APOSTILAS PREMIUM*\n\n`;
    mensagem += `*📋 DADOS DO CLIENTE:*\n`;
    mensagem += `👤 Nome: ${nome}\n`;
    mensagem += `📱 Telefone: ${telefone}\n`;
    mensagem += `📧 E-mail: ${email}\n`;
    mensagem += `📍 Endereço: ${rua}, ${numero}${complemento ? ', ' + complemento : ''}\n`;
    mensagem += `🏘️ Bairro: ${bairro}\n`;
    mensagem += `🏙️ Cidade: ${cidade} - ${estado}\n`;
    mensagem += `📮 CEP: ${cep}\n`;
    mensagem += `🚚 Entrega: ${metodoEntrega === 'retirada' ? 'Retirada no Local' : 'Entrega em Domicílio'}\n`;
    if (observacoes) mensagem += `📝 Observações: ${observacoes}\n`;
    mensagem += `\n`;
    
    mensagem += `*🛍️ ITENS DO PEDIDO:*\n`;
    let totalImpressao = 0;
    let totalEncadernacao = 0;
    let totalGeral = 0;
    
    carrinho.forEach((item, index) => {
        const precoTotalItem = item.precoUnitario * item.quantidade;
        const precoEncadernacaoItem = PRECO_ENCADERNAÇÃO * item.quantidade;
        const precoImpressaoItem = precoTotalItem - precoEncadernacaoItem;
        
        totalImpressao += precoImpressaoItem;
        totalEncadernacao += precoEncadernacaoItem;
        totalGeral += precoTotalItem;
        
        mensagem += `${index + 1}. *${item.tipoNome}* - ${item.folhas} folhas\n`;
        mensagem += `   Quantidade: ${item.quantidade}\n`;
        mensagem += `   Preço unitário: R$ ${item.precoUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n`;
        mensagem += `   Subtotal: R$ ${precoTotalItem.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n\n`;
    });
    
    // Adicionar frete se for entrega
    if (metodoEntrega === 'entrega') {
        totalGeral += freteValor;
    }
    
    mensagem += `*💰 RESUMO DO PEDIDO:*\n`;
    mensagem += `Subtotal (Impressão): R$ ${totalImpressao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n`;
    mensagem += `Encadernação (já inclusa): R$ ${totalEncadernacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n`;
    if (metodoEntrega === 'entrega') {
        mensagem += `Frete (${cidade}): R$ ${freteValor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n`;
    }
    mensagem += `*TOTAL DO PEDIDO: R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}*\n\n`;
    
    mensagem += `*📦 INFORMAÇÕES DE ENTREGA:*\n`;
    if (metodoEntrega === 'retirada') {
        mensagem += `📍 Retirada: Av. Brasil, 284 - Casqueiro, Cubatão - SP\n`;
        mensagem += `⏰ Horário: Segunda a Sexta, 09:00 às 16:00\n`;
    } else {
        mensagem += `🚚 Entrega para ${cidade}\n`;
    }
    
    mensagem += `\n`;
    mensagem += `*🔧 Encadernação padrão inclusa:*\n`;
    mensagem += `• Capa Preta no Final\n`;
    mensagem += `• Capa Transparente\n`;
    mensagem += `• Encadernação na Esquerda\n`;
    mensagem += `• Espiral Preto\n\n`;
    
    // ADICIONE ESTA MENSAGEM NO FINAL
    mensagem += `*📄 INFORMAÇÃO IMPORTANTE:*\n`;
    mensagem += `Olá! Agora que você escolheu a melhor configuração de apostila, nos envie o arquivo para produção, por aqui ou no email e aguarde nosso contato.`;
    
    // Codificar mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Número do WhatsApp
    const numeroWhatsApp = '5513988089754';
    
    // Criar URL do WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
    
    // Abrir WhatsApp em nova aba
    window.open(urlWhatsApp, '_blank');
    
    // Limpar carrinho e formulário após envio
    carrinho = [];
    atualizarCarrinho();
    
    // Limpar formulário
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-cep').value = '';
    document.getElementById('customer-number').value = '';
    document.getElementById('customer-street').value = '';
    document.getElementById('customer-neighborhood').value = '';
    document.getElementById('customer-city').value = '';
    document.getElementById('customer-state').value = '';
    document.getElementById('customer-complement').value = '';
    document.getElementById('delivery-method').value = '';
    document.getElementById('customer-notes').value = '';
    
    // Resetar frete
    document.getElementById('frete-calculo').style.display = 'none';
    
    // Fechar modal do carrinho
    document.getElementById('cart-modal').style.display = 'none';
    
    // Mostrar mensagem de sucesso
    mostrarFeedback('Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.');
}

// Configurar eventos do checkout
function configurarEventosCheckout() {
    // Configurar eventos do formulário
    document.getElementById('customer-phone').addEventListener('input', function() {
        formatarTelefone(this);
    });
    
    document.getElementById('customer-cep').addEventListener('input', function() {
        formatarCEP(this);
    });
    
    // Evento para buscar CEP quando o usuário sai do campo
    document.getElementById('customer-cep').addEventListener('blur', buscarCEP);
    
    // Evento para mudança no método de entrega
    document.getElementById('delivery-method').addEventListener('change', function() {
        const freteCalculoDiv = document.getElementById('frete-calculo');
        const cidade = document.getElementById('customer-city').value.trim();
        
        if (this.value === 'entrega' && cidade) {
            calcularFreteParaCidade(cidade);
        } else {
            freteCalculoDiv.style.display = 'none';
        }
        
        atualizarCarrinho();
    });
    
    // Evento para validação em tempo real do formulário
    const camposFormulario = [
        'customer-name', 'customer-phone', 'customer-email', 'customer-cep',
        'customer-number', 'customer-street', 'customer-neighborhood',
        'customer-city', 'customer-state', 'delivery-method'
    ];
    
    camposFormulario.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const formValido = validarFormularioCliente();
            const whatsappButton = document.getElementById('whatsapp-checkout');
            whatsappButton.disabled = !(carrinho.length > 0 && formValido);
        });
    });
    
    // Configurar envio por WhatsApp
    document.getElementById('whatsapp-checkout').addEventListener('click', enviarPedidoWhatsApp);
    
    // Evento para calcular frete quando a cidade mudar
    document.getElementById('customer-city').addEventListener('change', function() {
        if (document.getElementById('delivery-method').value === 'entrega' && this.value.trim()) {
            calcularFreteParaCidade(this.value.trim());
        }
    });
}

// Inicializar eventos do checkout quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', configurarEventosCheckout);