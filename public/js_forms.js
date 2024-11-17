document.getElementById("orderForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Capturar os dados do formulário
    const formData = new FormData(event.target);
    const newOrder = {
        idCliente: formData.get("clientId"),
        nomeCliente: formData.get("clientName"),
        distancia: parseFloat(formData.get("distance")),
        tipoEntrega: formData.get("deliveryType"),
        tipoPagamento: formData.get("paymentType"),
        dataHora: new Date().toISOString().replace("T", " ").split(".")[0],
        pedido: formData.get("orderItems"),
        valorTotal: parseFloat(formData.get("totalValue")),
        quantidadeItens: parseInt(formData.get("itemQuantity")),
        temPizza: formData.get("hasPizza") === "1" ? "Sim" : "Não",
        temBebida: formData.get("hasDrink") === "1" ? "Sim" : "Não"
    };

    // Adicionar a nova linha à tabela
    addOrderToCSV(newOrder);
    alert("Pedido adicionado com sucesso!");
    event.target.reset();
});

function addOrderToCSV(order) {
    const table = document.getElementById("ordersTable");
    if (!table) return; // Apenas continua se a tabela estiver carregada

    const row = document.createElement("tr");
    Object.values(order).forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
    });
    table.querySelector("tbody").appendChild(row);

    // Aqui, pode-se implementar o código para salvar no servidor via API ou backend
    console.log("Pedido adicionado:", order);
}
