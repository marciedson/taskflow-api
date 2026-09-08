let projetos = [];

module.exports = {
    listar: () => projetos,
    buscarPorId: (id) => projetos.find(p => p.id === Number(id)),
    criar: (projeto) => {
        const novoProjeto = { id: Date.now(), ...projeto };
        projetos.push(novoProjeto);
        return novoProjeto;
    }
};