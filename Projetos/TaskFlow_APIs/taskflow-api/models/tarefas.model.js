let tarefas = [];

module.exports = {
    listar: () => tarefas,
    buscarPorId: (id) => tarefas.find(t => t.id === Number(id)),
    criar: (tarefa) => {
        const novaTarefa = { id: Date.now(), ...tarefa };
        tarefas.push(novaTarefa);
        return novaTarefa;
    },
    atualizar: (id, tarefaAtualizada) => {
        const indice = tarefas.findIndex(t => t.id === Number(id));
        if (indice === -1) return null;

        tarefas[indice] = { ...tarefas[indice], ...tarefaAtualizada, id: Number(id) };
        return tarefas[indice];
    },
    deletar: (id) => {
        const indice = tarefas.findIndex(t => t.id === Number(id));
        if (indice === -1) return null;

        const [removida] = tarefas.splice(indice, 1);
        return removida;
    }
};