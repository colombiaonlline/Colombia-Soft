const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza de tarjetas de agencia y paquetes...');
  try {
    // TRUNCATE TABLE elimina todos los registros de 'tarjetas_agencia' y 'paquetes'.
    // CASCADE elimina en cascada todos los registros en las tablas que dependen de ellas (por ejemplo, tarifas de paquetes, vuelos de paquetes, hoteles de paquetes, etc.)
    // RESTART IDENTITY reinicia las secuencias de autoincremento de ambos a 1.
    await prisma.$executeRawUnsafe('TRUNCATE TABLE tarjetas_agencia, paquetes RESTART IDENTITY CASCADE;');
    console.log('¡Éxito! Todas las tarjetas de la agencia y paquetes turísticos (junto a sus configuraciones) han sido eliminados.');
    console.log('Las secuencias de autoincremento para tarjetas_agencia y paquetes han sido reiniciadas a 1 (0001).');
  } catch (error) {
    console.error('Error al limpiar tarjetas y paquetes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
