// Adicionar ao carrinho
function adicionarAoCarrinho(apostilaId) {
    const apostila = apostilas.find(a => a.id === apostilaId);
    const itemExistente = carrinho.find(item => item.id === apostilaId);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: apostila.id,
            tipoNome: apostila.tipoNome,
            folhas: apostila.folhas,
            precoUnitario: parseFloat(apostila.precoComEncadernacao),
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    mostrarFeedback(`${apostila.tipoNome} (${apostila.folhas} folhas) adicionada ao carrinho!`);
}

// Atualizar carrinho com frete
function atualizarCarrinho() {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    document.getElementById('cart-count').textContent = totalItens;
    
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartEncadernacao = document.getElementById('cart-encadernacao');
    const cartTotal = document.getElementById('cart-total');
    const freteItem = document.getElementById('frete-item');
    const cartFrete = document.getElementById('cart-frete');
    const whatsappButton = document.getElementById('whatsapp-checkout');
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p>Seu carrinho está vazio. Adicione apostilas para continuar.</p>';
        cartSubtotal.textContent = 'R$ 0,00';
        cartEncadernacao.textContent = 'R$ 0,00';
        cartTotal.textContent = 'R$ 0,00';
        freteItem.style.display = 'none';
        whatsappButton.disabled = true;
        return;
    }
    
    // Calcular subtotais
    let subtotalImpressao = 0;
    let encadernacaoTotal = 0;
    let subtotal = 0;
    
    cartItems.innerHTML = '';
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const precoTotalItem = item.precoUnitario * item.quantidade;
        const precoEncadernacaoItem = PRECO_ENCADERNAÇÃO * item.quantidade;
        const precoImpressaoItem = precoTotalItem - precoEncadernacaoItem;
        
        subtotalImpressao += precoImpressaoItem;
        encadernacaoTotal += precoEncadernacaoItem;
        subtotal += precoTotalItem;
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.tipoNome}</h4>
                <p>${item.folhas} folhas</p>
                <p class="cart-item-price">R$ ${item.precoUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} cada</p>
            </div>
            <div class="cart-item-actions">
                <button class="btn-decrease" data-id="${item.id}">-</button>
                <span>${item.quantidade}</span>
                <button class="btn-increase" data-id="${item.id}">+</button>
                <button class="btn-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
    });
    
    // Calcular frete se necessário
    const deliveryMethod = document.getElementById('delivery-method').value;
    let freteValor = 0;
    
    if (deliveryMethod === 'entrega') {
        const freteCalculado = parseFloat(document.getElementById('valor-frete').textContent.replace('R$ ', '').replace(',', '.'));
        if (!isNaN(freteCalculado)) {
            freteValor = freteCalculado;
        }
    }
    
    // Atualizar totais
    cartSubtotal.textContent = `R$ ${subtotalImpressao.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    cartEncadernacao.textContent = `R$ ${encadernacaoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    if (freteValor > 0) {
        freteItem.style.display = 'flex';
        cartFrete.textContent = `R$ ${freteValor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    } else {
        freteItem.style.display = 'none';
    }
    
    const totalFinal = subtotal + freteValor;
    cartTotal.textContent = `R$ ${totalFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Habilitar botão do WhatsApp se houver itens e formulário válido
    const formValido = validarFormularioCliente();
    whatsappButton.disabled = !(carrinho.length > 0 && formValido);
    
    // Adicionar eventos aos botões do carrinho
    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.id;
            alterarQuantidade(itemId, -1);
        });
    });
    
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.id;
            alterarQuantidade(itemId, 1);
        });
    });
    
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.id;
            removerDoCarrinho(itemId);
        });
    });
}

// Alterar quantidade no carrinho
function alterarQuantidade(itemId, mudanca) {
    const itemIndex = carrinho.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        carrinho[itemIndex].quantidade += mudanca;
        
        if (carrinho[itemIndex].quantidade <= 0) {
            carrinho.splice(itemIndex, 1);
        }
        
        atualizarCarrinho();
    }
}

// Remover do carrinho
function removerDoCarrinho(itemId) {
    const itemIndex = carrinho.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        const itemRemovido = carrinho[itemIndex];
        carrinho.splice(itemIndex, 1);
        atualizarCarrinho();
        mostrarFeedback(`${itemRemovido.tipoNome} removida do carrinho.`);
    }
}