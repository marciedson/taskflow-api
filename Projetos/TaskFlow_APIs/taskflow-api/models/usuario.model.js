let usuarios = [];

module.exports = {
    listar: () => usuarios,
    buscarPorId: (id) => usuarios.find(u => u.id === Number(id)),
    criar: (usuario) => {
        const novoUsuario = { id: Date.now(), ...usuario };
        usuarios.push(novoUsuario);
        return novoUsuario;
    }
};