require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env.test'),
  quiet: true,
  override: true,
});

if (process.env.AMBIENTE !== 'teste') {
  throw new Error('Crie o arquivo .env.test antes de rodar os testes');
}

for (const variable of ['DATABASE_URL', 'DIRECT_URL']) {
  const value = process.env[variable];
  if (!value || /cole-aqui/i.test(value)) {
    throw new Error(`Configure ${variable} no .env.test com a URL do branch de teste do Neon`);
  }

  try {
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`Configure ${variable} no .env.test com uma URL PostgreSQL válida`);
  }
}
