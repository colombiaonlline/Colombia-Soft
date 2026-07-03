const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza de comisionistas y responsables...');
  try {
    // TRUNCATE TABLE elimina todos los registros de 'comisionistas' y 'responsables'.
    // CASCADE elimina en cascada los registros relacionados en otras tablas si existieran.
    // RESTART IDENTITY reinicia las secuencias de autoincremento de ambos a 1.
    await prisma.$executeRawUnsafe('TRUNCATE TABLE comisionistas, responsables RESTART IDENTITY CASCADE;');
    console.log('¡Éxito! Todos los comisionistas y responsables han sido eliminados.');
    console.log('Las secuencias de autoincremento para comisionistas y responsables han sido reiniciadas a 1 (0001).');
  } catch (error) {
    console.error('Error al limpiar comisionistas y responsables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
