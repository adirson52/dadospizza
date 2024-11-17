

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
    const totalVendas = ordersData.reduce((sum, order) => sum + order.valorTotal, 0);
    const totalPedidos = ordersData.length;
    const valorMedio = totalVendas / totalPedidos || 0;
    const distanciaMedia = ordersData.reduce((sum, order) => sum + order.distancia, 0) / totalPedidos || 0;
    const totalClientes = new Set(ordersData.map(order => order.idCliente)).size;
    const mediaItensPorPedido = ordersData.reduce((sum, order) => sum + order.quantidadeItens, 0) / totalPedidos || 0;
    const pedidosComPizza = ordersData.filter(order => order.temPizza === "Sim").length;
    const pedidosComBebida = ordersData.filter(order => order.temBebida === "Sim").length;
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

    // Produtos Mais Vendidos
    const produtosVendidos = {};
    ordersData.forEach(order => {
        const produtos = order.pedido.split(", ");
        produtos.forEach(produto => {
            produtosVendidos[produto] = (produtosVendidos[produto] || 0) + 1;
        });
    });

    const produtosLabels = Object.keys(produtosVendidos);
    const produtosValues = Object.values(produtosVendidos);

    const productCtx = document.getElementById('productChart').getContext('2d');
    new Chart(productCtx, {
        type: 'bar',
        data: {
            labels: produtosLabels,
            datasets: [{
                label: 'Quantidade Vendida',
                data: produtosValues,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true
        }
    });

    // Horários de Pico
    const horarios = {};
    ordersData.forEach(order => {
        const hora = parseInt(order.hora.split(":")[0]);
        horarios[hora] = (horarios[hora] || 0) + 1;
    });

    const horariosLabels = Object.keys(horarios).map(h => h + "h");
    const horariosValues = Object.values(horarios);

    const hourCtx = document.getElementById('hourChart').getContext('2d');
    new Chart(hourCtx, {
        type: 'line',
        data: {
            labels: horariosLabels,
            datasets: [{
                label: 'Pedidos',
                data: horariosValues,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 1)',
                fill: true
            }]
        },
        options: {
            responsive: true
        }
    });

    // Distribuição por Distância
    const distancias = ordersData.map(order => order.distancia);
    distancias.sort((a, b) => a - b);
    const distanciaLabels = [...new Set(distancias.map(d => d.toFixed(1)))];
    const distanciaCounts = distanciaLabels.map(label => {
        return distancias.filter(d => d.toFixed(1) === label).length;
    });

    const distanceCtx = document.getElementById('distanceChart').getContext('2d');
    new Chart(distanceCtx, {
        type: 'bar',
        data: {
            labels: distanciaLabels,
            datasets: [{
                label: 'Número de Entregas',
                data: distanciaCounts,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 1)'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distância (km)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequência'
                    },
                    beginAtZero: true
                }
            },
            responsive: true
        }
    });

    // Formas de Pagamento
    const pagamentos = {};
    ordersData.forEach(order => {
        pagamentos[order.tipoPagamento] = (pagamentos[order.tipoPagamento] || 0) + 1;
    });

    const pagamentosLabels = Object.keys(pagamentos);
    const pagamentosValues = Object.values(pagamentos);

    const paymentCtx = document.getElementById('paymentChart').getContext('2d');
    new Chart(paymentCtx, {
        type: 'pie',
        data: {
            labels: pagamentosLabels,
            datasets: [{
                data: pagamentosValues,
                backgroundColor: [
                    'rgba(0, 0, 0, 0.8)',
                    'rgba(100, 100, 100, 0.8)',
                    'rgba(200, 200, 200, 0.8)',
                    'rgba(150, 150, 150, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(100, 100, 100, 1)',
                    'rgba(200, 200, 200, 1)',
                    'rgba(150, 150, 150, 1)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });

    // Pedidos por Dia da Semana
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const pedidosPorDia = Array(7).fill(0);
    ordersData.forEach(order => {
        const data = new Date(order.data.split('/').reverse().join('-'));
        const dia = data.getDay();
        pedidosPorDia[dia] += 1;
    });

    const weekdayCtx = document.getElementById('weekdayChart').getContext('2d');
    new Chart(weekdayCtx, {
        type: 'bar',
        data: {
            labels: diasSemana,
            datasets: [{
                label: 'Pedidos',
                data: pedidosPorDia,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 1)'
            }]
        },
        options: {
            responsive: true
        }
    });

    // Métodos de Entrega Preferidos
    const entregas = {};
    ordersData.forEach(order => {
        entregas[order.tipoEntrega] = (entregas[order.tipoEntrega] || 0) + 1;
    });

    const entregasLabels = Object.keys(entregas);
    const entregasValues = Object.values(entregas);

    const deliveryCtx = document.getElementById('deliveryChart').getContext('2d');
    new Chart(deliveryCtx, {
        type: 'doughnut',
        data: {
            labels: entregasLabels,
            datasets: [{
                data: entregasValues,
                backgroundColor: [
                    'rgba(0, 0, 0, 0.8)',
                    'rgba(100, 100, 100, 0.8)',
                    'rgba(200, 200, 200, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(100, 100, 100, 1)',
                    'rgba(200, 200, 200, 1)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });

    // Itens por Pedido
    const itensLabels = [...new Set(ordersData.map(order => order.quantidadeItens))];
    const itensCounts = itensLabels.map(label => {
        return ordersData.filter(order => order.quantidadeItens == label).length;
    });

    const itemsCtx = document.getElementById('itemsChart').getContext('2d');
    new Chart(itemsCtx, {
        type: 'bar',
        data: {
            labels: itensLabels,
            datasets: [{
                label: 'Número de Pedidos',
                data: itensCounts,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 1)'
            }]
        },
        options: {
            responsive: true
        }
    });

    // Receita por Cliente
    const receitaPorCliente = {};
    ordersData.forEach(order => {
        receitaPorCliente[order.nomeCliente] = (receitaPorCliente[order.nomeCliente] || 0) + order.valorTotal;
    });

    const clientesLabels = Object.keys(receitaPorCliente);
    const receitaValues = Object.values(receitaPorCliente);

    const revenueCustomerCtx = document.getElementById('revenueCustomerChart').getContext('2d');
    new Chart(revenueCustomerCtx, {
        type: 'bar',
        data: {
            labels: clientesLabels,
            datasets: [{
                label: 'Receita (R$)',
                data: receitaValues,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 1)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true
        }
    });

    // Percentual de Pedidos com Pizza
    const pizzaCtx = document.getElementById('pizzaChart').getContext('2d');
    new Chart(pizzaCtx, {
        type: 'pie',
        data: {
            labels: ['Com Pizza', 'Sem Pizza'],
            datasets: [{
                data: [pedidosComPizza, totalPedidos - pedidosComPizza],
                backgroundColor: [
                    'rgba(0, 0, 0, 0.8)',
                    'rgba(200, 200, 200, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(200, 200, 200, 1)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
};

// Carregar Segmentação
const loadSegmentation = async () => {
    if (ordersData.length === 0) {
        await loadOrders();
    }

    // RFM Analysis
    clientes = {}; // Variável global

    ordersData.forEach(order => {
        const id = order.idCliente;
        if (!clientes[id]) {
            clientes[id] = {
                idCliente: id,
                nome: order.nomeCliente,
                frequencia: 0,
                monetario: 0,
                ultimaCompra: new Date(order.data.split('/').reverse().join('-'))
            };
        }
        clientes[id].frequencia += 1;
        clientes[id].monetario += order.valorTotal;
        const dataPedido = new Date(order.data.split('/').reverse().join('-'));
        if (dataPedido > clientes[id].ultimaCompra) {
            clientes[id].ultimaCompra = dataPedido;
        }
    });

    // Calcular Recência (em dias)
    const hoje = new Date();
    for (let id in clientes) {
        const diffTime = Math.abs(hoje - clientes[id].ultimaCompra);
        clientes[id].recencia = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Definir pontuações R, F, M
    const recencias = Object.values(clientes).map(c => c.recencia);
    const frequencias = Object.values(clientes).map(c => c.frequencia);
    const monetarios = Object.values(clientes).map(c => c.monetario);

    const recenciaQuartis = getQuartiles(recencias);
    const frequenciaQuartis = getQuartiles(frequencias);
    const monetarioQuartis = getQuartiles(monetarios);

    for (let id in clientes) {
    const cliente = clientes[id];
    cliente.RScore = getScore(cliente.recencia, recenciaQuartis, true);
    cliente.FScore = getScore(cliente.frequencia, frequenciaQuartis);
    cliente.MScore = getScore(cliente.monetario, monetarioQuartis);
    cliente.RFMScore = `${cliente.RScore}${cliente.FScore}${cliente.MScore}`;

    // Passar 'cliente.recencia' como argumento
    cliente.segmento = getSegment(cliente.RScore, cliente.FScore, cliente.MScore, cliente.recencia);
    }


    // Lista de ações
    const acoesPorSegmento = {
        "Melhores Clientes": "Recompensar com ofertas exclusivas",
        "Clientes Leais": "Oferecer programas de fidelidade",
        "Clientes Potenciais": "Enviar promoções especiais",
        "Clientes em Risco": "Reengajar com descontos",
        "Clientes Inativos": "Tentar reativação com ofertas atrativas",
        "Clientes Regulares": "Manter comunicação"
    };

    // Preparar dados para a tabela de resumo
    const segmentos = {};
    const totalClientes = Object.keys(clientes).length;
    const scatterRF = [];
    const scatterFM = [];

    for (let id in clientes) {
        const cliente = clientes[id];

        if (!segmentos[cliente.segmento]) {
            segmentos[cliente.segmento] = {
                contagem: 0,
                recenciaTotal: 0,
                frequenciaTotal: 0,
                monetarioTotal: 0,
                clientes: []
            };
        }
        segmentos[cliente.segmento].contagem += 1;
        segmentos[cliente.segmento].recenciaTotal += cliente.recencia;
        segmentos[cliente.segmento].frequenciaTotal += cliente.frequencia;
        segmentos[cliente.segmento].monetarioTotal += cliente.monetario;
        segmentos[cliente.segmento].clientes.push(cliente);

        // Dados para gráficos de dispersão
        scatterRF.push({ x: cliente.recencia, y: cliente.frequencia });
        scatterFM.push({ x: cliente.frequencia, y: cliente.monetario });
    }

    // Exibir na tabela de resumo
    const tableBody = document.getElementById("rfmSummaryTable").querySelector("tbody");
    tableBody.innerHTML = "";

    for (let segmento in segmentos) {
        const data = segmentos[segmento];
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${segmento}</td>
            <td>${data.contagem}</td>
            <td>${((data.contagem / totalClientes) * 100).toFixed(1).replace(".", ",")}%</td>
            <td>${(data.recenciaTotal / data.contagem).toFixed(2).replace(".", ",")}</td>
            <td>${(data.frequenciaTotal / data.contagem).toFixed(2).replace(".", ",")}</td>
            <td>${(data.monetarioTotal / data.contagem).toFixed(2).replace(".", ",")}</td>
        `;
        tableBody.appendChild(tr);
    }

    // Gráfico de Dispersão Recência x Frequência
    const rfCtx = document.getElementById('rfChart').getContext('2d');
    new Chart(rfCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Clientes',
                data: scatterRF,
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Recência (dias)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequência'
                    },
                    beginAtZero: true
                }
            },
            responsive: true
        }
    });

    // Gráfico de Dispersão Frequência x Monetário
    const fmCtx = document.getElementById('fmChart').getContext('2d');
    new Chart(fmCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Clientes',
                data: scatterFM,
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Frequência'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Monetário (R$)'
                    }
                }
            },
            responsive: true
        }
    });
};

// Carregar Clientes Inativos
const loadInactiveClients = async () => {
    if (ordersData.length === 0) {
        await loadOrders();
    }
    if (Object.keys(clientes).length === 0) {
        await loadSegmentation();
    }

    // Filtrar clientes inativos (Recência > 90 dias)
    const inactiveClients = Object.values(clientes).filter(cliente => cliente.recencia > 90);

    const tableBody = document.getElementById("inactiveCustomersTable").querySelector("tbody");
    tableBody.innerHTML = "";

    inactiveClients.forEach(cliente => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cliente.idCliente}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.recencia}</td>
            <td>${cliente.frequencia}</td>
            <td>${cliente.monetario.toFixed(2).replace(".", ",")}</td>
            <td>Oferecer promoção de reativação</td>
        `;
        tableBody.appendChild(tr);
    });
};

// Funções auxiliares
function getQuartiles(values) {
    values.sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length / 4)];
    const q2 = values[Math.floor(values.length / 2)];
    const q3 = values[Math.floor(values.length * 3 / 4)];
    return [q1, q2, q3];
}

function getScore(value, quartiles, invert = false) {
    if (invert) {
        if (value <= quartiles[0]) return 5;
        else if (value <= quartiles[1]) return 4;
        else if (value <= quartiles[2]) return 3;
        else return 2;
    } else {
        if (value <= quartiles[0]) return 2;
        else if (value <= quartiles[1]) return 3;
        else if (value <= quartiles[2]) return 4;
        else return 5;
    }
}

function getSegment(R, F, M, recencia) {
    if (recencia > 90) return "Clientes Inativos";
    if (R >= 4 && F >= 4 && M >= 4) return "Melhores Clientes";
    if (F >= 4 && M >= 4) return "Clientes Leais";
    if (R >= 3 && F >= 3 && M >= 3) return "Clientes Potenciais";
    if (R <= 2 && F <= 2 && M <= 2) return "Clientes em Risco";
    if (R >= 3) return "Clientes Recentes";
    return "Clientes Regulares";
}



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

document.getElementById("segmentationTab").addEventListener("click", () => {
    switchTab("segmentationSection");
    loadSegmentation();
});

document.getElementById("inactiveTab").addEventListener("click", () => {
    switchTab("inactiveSection");
    loadInactiveClients();
});

document.addEventListener("DOMContentLoaded", () => {
    switchTab("homeSection");
    loadMenu();
});
