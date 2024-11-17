const menuFile = "Pizzaria_Teste_Cardapio.csv";
const ordersFile = "Tabela_de_Pedidos_de_Clientes.csv";

let ordersData = [];
let clientes = {};

const switchTab = (sectionId) => {
    document.querySelectorAll("section").forEach(section => {
        section.classList.remove("visible");
    });
    document.getElementById(sectionId).classList.add("visible");
};

const loadMenu = async () => {
    try {
        const response = await fetch(menuFile);
        if (!response.ok) throw new Error("Erro ao carregar o cardápio.");
        const csvText = await response.text();
        const rows = csvText.split("\n").filter(row => row.trim() !== "");
        const tableBody = document.getElementById("menuTable").querySelector("tbody");
        tableBody.innerHTML = "";

        rows.slice(1).forEach(row => {
            const cols = row.split(";");
            if (cols.length < 2) return;
            const tr = document.createElement("tr");
            cols.forEach(col => {
                const td = document.createElement("td");
                td.textContent = col.trim();
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar o cardápio:", error);
    }
};

const cleanData = (line) => {
    return line.replace(/[\uFFFD]/g, "").replace(/"/g, "").trim();
};

const loadOrders = async () => {
    try {
        const response = await fetch(ordersFile);
        if (!response.ok) throw new Error("Erro ao carregar os pedidos.");
        const csvText = await response.text();

        const lines = csvText.split("\n").filter(line => line.trim() !== "");
        const tableBody = document.getElementById("ordersTable").querySelector("tbody");
        tableBody.innerHTML = "";
        ordersData = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = cleanData(lines[i]).split(",");
            if (cols.length < 11) continue;

            try {
                const dateTime = cols[5];
                const date = dateTime.split(" ")[0];
                const time = dateTime.split(" ")[1];

                const order = {
                    idCliente: cols[0],
                    nomeCliente: cols[1],
                    distancia: parseFloat(cols[2].replace(",", ".")) || 0,
                    tipoEntrega: cols[3],
                    tipoPagamento: cols[4],
                    data: date,
                    hora: time,
                    pedido: cols[6].replace(/^"|"$/g, ""),
                    valorTotal: parseFloat(cols[7].replace(",", ".")) || 0,
                    quantidadeItens: parseInt(cols[8]) || 0,
                    temPizza: cols[9].trim().toLowerCase() === "1" || cols[9].trim().toLowerCase() === "sim" ? "Sim" : "Não",
                    temBebida: cols[10].trim().toLowerCase() === "1" || cols[10].trim().toLowerCase() === "sim" ? "Sim" : "Não"
                };

                ordersData.push(order);

                const tr = document.createElement("tr");
                [
                    order.idCliente,
                    order.nomeCliente,
                    order.distancia.toFixed(2).replace(".", ","),
                    order.tipoEntrega,
                    order.tipoPagamento,
                    order.data,
                    order.hora,
                    order.pedido,
                    order.valorTotal.toFixed(2).replace(".", ","),
                    order.quantidadeItens,
                    order.temPizza,
                    order.temBebida
                ].forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = col;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            } catch (error) {
                console.warn(`Erro ao processar a linha ${i}:`, error);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar os pedidos:", error);
    }
};

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
