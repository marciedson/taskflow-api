let tarefas = [];

module.exports = {
    listar: () => tarefas,
    buscarPorId: (id) => tarefas.find(t => t.id === Number(id)),
    criar: (tarefa) => {
        const novaTarefa = { id: Date.now(), ...tarefa };
        tarefas.push(novaTarefa);
        return novaTarefa;
    }
};