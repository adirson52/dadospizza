document.getElementById("orderForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    // Cria a nova linha do pedido
    const newRow = [
        formData.get("clientId"),
        formData.get("clientName"),
        parseFloat(formData.get("distance").replace(",", ".")),
        formData.get("deliveryType"),
        formData.get("paymentType"),
        new Date().toISOString().replace("T", " ").split(".")[0], // Data e Hora do Pedido
        formData.get("orderItems"),
        parseFloat(formData.get("totalValue").replace(",", ".")),
        formData.get("itemQuantity"),
        formData.get("hasPizza"),
        formData.get("hasDrink")
    ].join(",") + "\n";

    // Token e detalhes do repositório
    const GITHUB_TOKEN = "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"; // Substituir pelo token real
    const REPO_OWNER = "adirson52";
    const REPO_NAME = "dadospizza";
    const FILE_PATH = "Tabela_de_Pedidos_de_Clientes.csv";

    try {
        // Buscar o conteúdo atual do arquivo CSV
        const fileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`
            }
        });

        if (!fileResponse.ok) throw new Error(`Erro ao buscar o arquivo: ${fileResponse.statusText}`);
        const fileData = await fileResponse.json();

        // Decodificar o conteúdo do arquivo em Base64
        const currentContent = decodeURIComponent(escape(atob(fileData.content))); // Decodifica para UTF-8
        const updatedContent = currentContent + newRow;

        // Re-encode em Base64 com UTF-8
        const encodedContent = btoa(unescape(encodeURIComponent(updatedContent))); // Codifica para UTF-8

        // Atualizar o arquivo no GitHub
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Adicionando novo pedido ao CSV",
                content: encodedContent, // Codifica o conteúdo atualizado em Base64 com UTF-8
                sha: fileData.sha // SHA do arquivo atual
            })
        });

        if (!updateResponse.ok) throw new Error(`Erro ao atualizar o arquivo: ${updateResponse.statusText}`);

        alert("Pedido adicionado com sucesso!");
        event.target.reset();
    } catch (error) {
        console.error("Erro ao adicionar o pedido:", error);
        alert("Erro ao adicionar o pedido.");
    }
});
