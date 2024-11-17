document.getElementById("orderForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const newOrder = {
        idCliente: formData.get("clientId"),
        nomeCliente: formData.get("clientName"),
        distancia: parseFloat(formData.get("distance").replace(",", ".")),
        tipoEntrega: formData.get("deliveryType"),
        tipoPagamento: formData.get("paymentType"),
        dataHora: new Date().toISOString().replace("T", " ").split(".")[0],
        pedido: formData.get("orderItems"),
        valorTotal: parseFloat(formData.get("totalValue").replace(",", ".")),
        quantidadeItens: parseInt(formData.get("itemQuantity")),
        temPizza: formData.get("hasPizza"),
        temBebida: formData.get("hasDrink")
    };

    try {
        const response = await fetch('/api/add-line', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrder)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            event.target.reset();
        } else {
            alert(`Erro: ${result.error}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar a linha:', error);
        alert('Erro ao adicionar a linha.');
    }
});
