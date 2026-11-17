const prisma = require('../database/prisma');

exports.listarTodas = async (req, res) => {
  try {
    const prioridades = await prisma.prioridades.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json(prioridades);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar prioridades', detalhes: error.message });
  }
};
