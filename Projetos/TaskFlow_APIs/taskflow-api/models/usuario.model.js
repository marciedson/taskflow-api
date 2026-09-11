let usuarios = [
    {
        id: 1,
        nome: 'Marciedson',
        email: 'marciedson@senai.com',
        senha: '123456'
    }
];

function buscarPorEmail(email) {
    return usuarios.find(u => u.email === email);
}

module.exports = {
    listar: () => usuarios,
    buscarPorId: (id) => usuarios.find(u => u.id === Number(id)),
    buscarPorEmail: (email) => usuarios.find(u => u.email === email),
    criar: (usuario) => {
        const novoUsuario = { id: Date.now(), ...usuario };
        usuarios.push(novoUsuario);
        return novoUsuario;
    },
    atualizar: (id, usuarioAtualizado) => {
        const indice = usuarios.findIndex(u => u.id === Number(id));
        if (indice === -1) return null;

        usuarios[indice] = { ...usuarios[indice], ...usuarioAtualizado, id: Number(id) };
        return usuarios[indice];
    },
    deletar: (id) => {
        const indice = usuarios.findIndex(u => u.id === Number(id));
        if (indice === -1) return null;

        const [removido] = usuarios.splice(indice, 1);
        return removido;
    }
};

module.exports.buscarPorEmail = buscarPorEmail;