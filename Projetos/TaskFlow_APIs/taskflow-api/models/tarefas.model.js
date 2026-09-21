const fs = require('fs');
const path = require('path');

const diretorioDados = path.join(__dirname, '..', 'data');
const arquivoDados = path.join(diretorioDados, 'tarefas.json');

function carregarTarefas() {
    fs.mkdirSync(diretorioDados, { recursive: true });

    if (!fs.existsSync(arquivoDados)) {
        fs.writeFileSync(arquivoDados, '[]', 'utf8');
        return [];
    }

    const conteudo = fs.readFileSync(arquivoDados, 'utf8');
    return conteudo.trim() ? JSON.parse(conteudo) : [];
}

function salvarTarefas(tarefas) {
    fs.writeFileSync(arquivoDados, JSON.stringify(tarefas, null, 2), 'utf8');
}

let tarefas = carregarTarefas();

module.exports = {
    listar: () => tarefas,
    buscarPorId: (id) => tarefas.find(t => t.id === Number(id)),
    criar: (tarefa) => {
        const novaTarefa = { id: Date.now(), ...tarefa };
        tarefas.push(novaTarefa);
        salvarTarefas(tarefas);
        return novaTarefa;
    },
    atualizar: (id, tarefaAtualizada) => {
        const indice = tarefas.findIndex(t => t.id === Number(id));
        if (indice === -1) return null;

        tarefas[indice] = { ...tarefas[indice], ...tarefaAtualizada, id: Number(id) };
        salvarTarefas(tarefas);
        return tarefas[indice];
    },
    deletar: (id) => {
        const indice = tarefas.findIndex(t => t.id === Number(id));
        if (indice === -1) return null;

        const [removida] = tarefas.splice(indice, 1);
        salvarTarefas(tarefas);
        return removida;
    }
};