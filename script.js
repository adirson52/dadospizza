// Função para limpar caracteres problemáticos
function cleanText(text) {
    return text
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢/g, 'â')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡/g, 'á')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£/g, 'ã')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©/g, 'é')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§/g, 'ç')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº/g, 'ú')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª/g, 'ê')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³/g, 'ó')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¨/g, 'è')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµ/g, 'õ')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±/g, 'ñ')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­/g, 'í')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³/g, 'ó')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­/g, 'í');
}

// Função para validar os dados de uma linha
function validateOrder(order) {
    // Verifica se a linha tem o número correto de colunas
    if (order.length !== 11) return false;

    // Verifica se os campos numéricos são válidos
    const distancia = parseFloat(order[2]);
    const valorTotal = parseFloat(order[7]);
    const quantidadeItens = parseInt(order[8]);

    if (isNaN(distancia) || isNaN(valorTotal) || isNaN(quantidadeItens)) return false;

    return true;
}

// Função para carregar e processar os dados do CSV
async function loadOrders() {
    const rawData = await fetch("Tabela_de_Pedidos_de_Clientes.csv").then(res => res.text());
    const cleanData = cleanText(rawData);
    const rows = cleanData.split("\n");

    ordersData = rows.map(parseCSVLine).filter(validateOrder); // Limpa e valida os dados

    console.log("Dados carregados e limpos:", ordersData); // Log para verificar os dados
}

// Função para analisar uma linha CSV
function parseCSVLine(text) {
    const regex = /(?:,|^)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g; // Para vírgula como separador
    let result = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        let matched = match[1] || match[2];
        if (matched === undefined) matched = '';
        matched = matched.replace(/""/g, '"');
        result.push(matched.trim());
    }
    return result;
}

// Carregar Estatísticas
const loadStats = async () => {
    if (ordersData.length === 0) {
        await loadOrders();
    }

    // Estatísticas Gerais
    const totalVendas = ordersData.reduce((sum, order) => sum + parseFloat(order[7]), 0);
    const totalPedidos = ordersData.length;
    const valorMedio = totalVendas / totalPedidos || 0;
    const distanciaMedia = ordersData.reduce((sum, order) => sum + parseFloat(order[2]), 0) / totalPedidos || 0;
    const totalClientes = new Set(ordersData.map(order => order[0])).size;
    const mediaItensPorPedido = ordersData.reduce((sum, order) => sum + parseInt(order[8]), 0) / totalPedidos || 0;
    const pedidosComPizza = ordersData.filter(order => order[9] === "1").length;
    const pedidosComBebida = ordersData.filter(order => order[10] === "1").length;
    const percentualPizza = (pedidosComPizza / totalPedidos) * 100;
    const percentualBebida = (pedidosComBebida / totalPedidos) * 100;

    const generalStats = document.getElementById("generalStats");
    generalStats.innerHTML = `
        <li>Total de Vendas: R$ ${totalVendas.toFixed(2).replace(".", ",")}</li>
        <li>Total de Pedidos: ${totalPedidos}</li>
        <li>Total de Clientes Únicos: ${totalClientes}</li>
        <li>Valor Médio dos Pedidos: R$ ${valorMedio.toFixed(2).replace(".", ",")}</li>
        <li>Distância Média de Entrega: ${distanciaMedia.toFixed(2).replace(".", ",")} km</li>
        <li>Média de Itens por Pedido: ${mediaItensPorPedido.toFixed(2).replace(".", ",")}</li>
        <li>Pedidos com Pizza: ${percentualPizza.toFixed(1).replace(".", ",")}%</li>
        <li>Pedidos com Bebida: ${percentualBebida.toFixed(1).replace(".", ",")}%</li>
    `;
};

// Configuração de Navegação
document.getElementById("homeTab").addEventListener("click", () => {
    switchTab("homeSection");
    loadMenu();
});

document.getElementById("ordersTab").addEventListener("click", () => {
    switchTab("ordersSection");
    loadOrders();
});

document.getElementById("statsTab").addEventListener("click", () => {
    switchTab("statsSection");
    loadStats();
});

// Iniciar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    switchTab("homeSection");
    loadMenu();
});
