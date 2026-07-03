const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la eliminación de todas las ventas...');
  try {
    // TRUNCATE TABLE elimina todos los registros de la tabla 'ventas'.
    // CASCADE elimina en cascada todos los registros relacionados en otras tablas (detalle_venta, pagos_venta, etc.)
    // RESTART IDENTITY reinicia las secuencias de autoincremento a 1.
    await prisma.$executeRawUnsafe('TRUNCATE TABLE ventas RESTART IDENTITY CASCADE;');
    console.log('¡Éxito! Todas las ventas y registros relacionados han sido eliminados.');
    console.log('El contador de ID de venta (secuencia) ha sido reiniciado a 1 (0001).');
  } catch (error) {
    console.error('Error al eliminar las ventas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
