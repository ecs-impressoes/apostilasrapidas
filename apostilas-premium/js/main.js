// Variáveis globais
let carrinho = [];
let apostilas = [];

// Tipos de apostila
const TIPOS = [
    { id: 'colorida-frente', nome: 'Colorida - Só Frente', classe: 'colorida' },
    { id: 'colorida-fv', nome: 'Colorida - Frente e Verso', classe: 'colorida' },
    { id: 'preta-frente', nome: 'Preta - Só Frente', classe: 'preta' },
    { id: 'preta-fv', nome: 'Preta - Frente e Verso', classe: 'preta' }
];

// Imagens para os tipos de apostila
const IMAGENS_TIPO = {
    'colorida': 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    'preta': 'https://images.unsplash.com/photo-1545231027-637d2f6210f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
};

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar apostilas
    inicializarApostilas();
    
    // Renderizar todas as apostilas inicialmente
    renderApostilas(apostilas);
    
    // Configurar eventos dos filtros
    document.getElementById('tipo').addEventListener('change', filtrarApostilas);
    document.getElementById('folhas').addEventListener('change', filtrarApostilas);
    document.getElementById('encadernacao').addEventListener('change', filtrarApostilas);
    
    // Configurar eventos da calculadora
    document.getElementById('calc-tipo').addEventListener('change', calcularPreco);
    document.getElementById('calc-folhas').addEventListener('input', calcularPreco);
    document.getElementById('calc-quantidade').addEventListener('input', calcularPreco);
    document.getElementById('calc-encadernacao').addEventListener('change', calcularPreco);
    
    // Calcular preço inicial
    calcularPreco();
    
    // Configurar eventos do carrinho
    document.getElementById('cart-icon').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'flex';
    });
    
    document.getElementById('close-cart').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'none';
    });
    
    // Fechar carrinho ao clicar fora
    document.getElementById('cart-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal') {
            document.getElementById('cart-modal').style.display = 'none';
        }
    });
    
    // Configurar rolagem suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Inicializar apostilas
function inicializarApostilas() {
    // Gerar números de folhas variados (mais de 40 modelos)
    const folhasVariadas = [];
    for (let i = 10; i <= 100; i += 10) {
        folhasVariadas.push(i);
    }
    for (let i = 120; i <= 200; i += 20) {
        folhasVariadas.push(i);
    }
    for (let i = 220; i <= 400; i += 20) {
        folhasVariadas.push(i);
    }
    
    // Gerar todas as apostilas
    TIPOS.forEach(tipo => {
        folhasVariadas.forEach(folhas => {
            const precoSemEncadernacao = (PRECOS[tipo.id] * folhas).toFixed(2);
            const precoComEncadernacao = (parseFloat(precoSemEncadernacao) + PRECO_ENCADERNAÇÃO).toFixed(2);
            
            apostilas.push({
                id: `${tipo.id}-${folhas}`,
                tipo: tipo.id,
                tipoNome: tipo.nome,
                classe: tipo.classe,
                folhas: folhas,
                precoSemEncadernacao: precoSemEncadernacao,
                precoComEncadernacao: precoComEncadernacao,
                imagemTipo: IMAGENS_TIPO[tipo.classe]
            });
        });
    });
}

// Renderizar apostilas
function renderApostilas(apostilasParaRenderizar) {
    const container = document.getElementById('apostilas-container');
    container.innerHTML = '';
    
    if (apostilasParaRenderizar.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Nenhuma apostila encontrada com os filtros selecionados.</p>';
        return;
    }
    
    apostilasParaRenderizar.forEach(apostila => {
        const card = document.createElement('div');
        card.className = 'apostila-card';
        card.dataset.id = apostila.id;
        
        card.innerHTML = `
            <div class="apostila-header ${apostila.classe}">
                <h3>${apostila.tipoNome}</h3>
                <p>${apostila.folhas} folhas</p>
            </div>
            <div class="apostila-body">
                <div class="apostila-details">
                    <div class="tipo-info">
                        <img src="${apostila.imagemTipo}" alt="${apostila.tipoNome.split(' - ')[0]}" class="tipo-imagem">
                        <span>${apostila.tipoNome.split(' - ')[0]}</span>
                    </div>
                    <div class="folhas-info">
                        <i class="fas fa-file-alt"></i>
                        <span>${apostila.folhas} folhas</span>
                    </div>
                </div>
                <div class="apostila-price">
                    <div class="price">R$ ${parseFloat(apostila.precoComEncadernacao).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="price-details">
                        <span>Preço já inclui encadernação</span>
                    </div>
                    <div class="encadernacao-info">
                        <div class="encadernacao-inclusa">
                            <i class="fas fa-check"></i> ENCADERNAÇÃO INCLUSA
                        </div>
                        <p><strong>Valor da encadernação:</strong> R$ 7,00 (já incluso)</p>
                        <p>Capa Preta no Final, Capa Transparente, Encadernação na Esquerda, Espiral Preto</p>
                    </div>
                </div>
                <div class="apostila-actions">
                    <button class="btn btn-buy btn-add-cart" data-id="${apostila.id}">Adicionar ao Carrinho</button>
                    <button class="btn btn-details btn-view-details" data-id="${apostila.id}">Detalhes</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const apostilaId = this.dataset.id;
            adicionarAoCarrinho(apostilaId);
        });
    });
    
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const apostilaId = this.dataset.id;
            const apostila = apostilas.find(a => a.id === apostilaId);
            mostrarDetalhes(apostila);
        });
    });
}

// Filtrar apostilas
function filtrarApostilas() {
    const tipoSelecionado = document.getElementById('tipo').value;
    const folhasSelecionadas = document.getElementById('folhas').value;
    const encadernacaoSelecionada = document.getElementById('encadernacao').value;
    
    let apostilasFiltradas = apostilas;
    
    // Filtrar por tipo
    if (tipoSelecionado !== 'todos') {
        apostilasFiltradas = apostilasFiltradas.filter(apostila => apostila.tipo === tipoSelecionado);
    }
    
    // Filtrar por número de folhas
    if (folhasSelecionadas !== 'todos') {
        let min, max;
        switch (folhasSelecionadas) {
            case '0-50':
                min = 0;
                max = 50;
                break;
            case '51-100':
                min = 51;
                max = 100;
                break;
            case '101-200':
                min = 101;
                max = 200;
                break;
            case '201-400':
                min = 201;
                max = 400;
                break;
        }
        
        apostilasFiltradas = apostilasFiltradas.filter(apostila => apostila.folhas >= min && apostila.folhas <= max);
    }
    
    renderApostilas(apostilasFiltradas);
}

// Mostrar detalhes da apostila
function mostrarDetalhes(apostila) {
    const precoSemEncadernacao = parseFloat(apostila.precoSemEncadernacao);
    const precoComEncadernacao = parseFloat(apostila.precoComEncadernacao);
    
    const detalhes = `
        <strong>Tipo:</strong> ${apostila.tipoNome}<br>
        <strong>Folhas:</strong> ${apostila.folhas}<br>
        <strong>Preço impressão:</strong> R$ ${precoSemEncadernacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br>
        <strong>Encadernação (já inclusa):</strong> R$ ${PRECO_ENCADERNAÇÃO.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br>
        <strong>Preço total (com encadernação):</strong> R$ ${precoComEncadernacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br><br>
        <strong>Detalhes da encadernação (já inclusa no preço):</strong><br>
        - Capa Preta no Final<br>
        - Capa Transparente<br>
        - Encadernação na Esquerda<br>
        - Espiral Preto<br><br>
        <strong><i class="fas fa-check-circle"></i> Encadernação já está incluída no preço total.</strong>
    `;
    
    alert(detalhes);
}

// Calcular preço personalizado
function calcularPreco() {
    const tipo = document.getElementById('calc-tipo').value;
    const folhas = parseInt(document.getElementById('calc-folhas').value);
    const quantidade = parseInt(document.getElementById('calc-quantidade').value);
    const encadernacao = document.getElementById('calc-encadernacao').value;
    
    if (folhas < 1 || folhas > 400) {
        alert('O número de folhas deve estar entre 1 e 400.');
        return;
    }
    
    const precoImpressao = PRECOS[tipo] * folhas * quantidade;
    const precoEncadernacao = encadernacao === 'sim' ? PRECO_ENCADERNAÇÃO * quantidade : 0;
    const precoTotal = precoImpressao + precoEncadernacao;
    
    // Formatar detalhes do cálculo
    let detalhes = '';
    if (tipo.includes('colorida')) {
        if (tipo.includes('fv')) {
            detalhes = `${folhas} folhas × R$ 0,72 (impressão colorida frente e verso)`;
        } else {
            detalhes = `${folhas} folhas × R$ 0,36 (impressão colorida frente)`;
        }
    } else {
        if (tipo.includes('fv')) {
            detalhes = `${folhas} folhas × R$ 0,50 (impressão preta frente e verso)`;
        } else {
            detalhes = `${folhas} folhas × R$ 0,25 (impressão preta frente)`;
        }
    }
    
    detalhes += ` × ${quantidade} apostilas = R$ ${precoImpressao.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    if (encadernacao === 'sim') {
        detalhes += ` + R$ ${precoEncadernacao.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (encadernação já inclusa)`;
    }
    
    detalhes += ` = R$ ${precoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Atualizar a interface
    document.getElementById('preco-calculado').textContent = `R$ ${precoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('detalhes-calculadora').textContent = detalhes;
}

// Mostrar feedback
function mostrarFeedback(mensagem) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideUp 0.3s ease;
    `;
    
    feedback.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 3000);
}