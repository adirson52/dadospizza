import fetch from 'node-fetch';

const GITHUB_TOKEN = 'SEU_TOKEN_AQUI';
const REPO_OWNER = 'adirson52'; // Substitua pelo seu nome de usuário do GitHub
const REPO_NAME = 'dadospizza'; // Substitua pelo nome do seu repositório
const FILE_PATH = 'Tabela_de_Pedidos_de_Clientes.csv'; // Caminho do arquivo no repositório

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            idCliente,
            nomeCliente,
            distancia,
            tipoEntrega,
            tipoPagamento,
            dataHora,
            pedido,
            valorTotal,
            quantidadeItens,
            temPizza,
            temBebida
        } = req.body;

        if (!idCliente || !nomeCliente || !distancia || !tipoEntrega || !tipoPagamento || !dataHora || !pedido || !valorTotal || !quantidadeItens || temPizza === undefined || temBebida === undefined) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        const newLine = `${idCliente};${nomeCliente};${distancia};${tipoEntrega};${tipoPagamento};${dataHora};${pedido};${valorTotal};${quantidadeItens};${temPizza};${temBebida}\n`;

        try {
            // Obter o SHA do arquivo atual
            const fileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`
                }
            });

            if (!fileResponse.ok) {
                throw new Error(`Erro ao buscar o arquivo: ${fileResponse.statusText}`);
            }

            const fileData = await fileResponse.json();
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            const updatedContent = content + newLine; // Adicionar a nova linha ao final do arquivo

            // Atualizar o arquivo no GitHub
            const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Adicionando nova linha ao CSV',
                    content: Buffer.from(updatedContent).toString('base64'),
                    sha: fileData.sha
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`Erro ao atualizar o arquivo: ${updateResponse.statusText}`);
            }

            res.status(200).json({ message: 'Linha adicionada com sucesso!' });
        } catch (error) {
            console.error('Erro ao adicionar a linha:', error);
            res.status(500).json({ error: 'Erro ao adicionar a linha ao arquivo.' });
        }
    } else {
        res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }
}
