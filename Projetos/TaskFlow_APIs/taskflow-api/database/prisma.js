require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../generated/prisma/client.ts');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
