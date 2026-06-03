/**
 * Hard-delete all sales except id=70 (children first, then ventas).
 * Run: node scripts/delete-sales-except-70.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const KEEP_SALE_ID = 70;

const prisma = new PrismaClient();

async function main() {
  const kept = await prisma.ventas.findUnique({ where: { id: KEEP_SALE_ID } });
  if (!kept) {
    throw new Error(`Venta ${KEEP_SALE_ID} no existe. Abortando.`);
  }

  const toDelete = await prisma.ventas.count({ where: { id: { not: KEEP_SALE_ID } } });
  console.log(`Venta ${KEEP_SALE_ID} encontrada (status: ${kept.status}).`);
  console.log(`Ventas a eliminar: ${toDelete}`);

  if (toDelete === 0) {
    console.log('No hay ventas adicionales que borrar.');
    return;
  }

  const detailIds = (
    await prisma.detalleVenta.findMany({
      where: { ventaId: { not: KEEP_SALE_ID } },
      select: { id: true },
    })
  ).map((d) => d.id);

  await prisma.$transaction(
    async (tx) => {
      if (detailIds.length > 0) {
        const ticketIds = (
          await tx.prodTiqueteria.findMany({
            where: { detalleVentaId: { in: detailIds } },
            select: { id: true },
          })
        ).map((t) => t.id);

        if (ticketIds.length > 0) {
          const tramos = await tx.tramosVuelo.deleteMany({
            where: { prodTiqueteriaId: { in: ticketIds } },
          });
          console.log(`  tramos_vuelo: ${tramos.count}`);
        }

        const prodTables = [
          'prodTiqueteria',
          'prodHoteleria',
          'prodPlanes',
          'prodSeguros',
          'prodCheckins',
          'prodMigracion',
          'prodSimcards',
          'prodAutos',
          'prodFincas',
          'prodTours',
          'prodEventos',
          'prodRestaurantes',
          'prodVisas',
          'prodPasaportes',
          'prodMascotas',
        ];

        for (const table of prodTables) {
          const r = await tx[table].deleteMany({
            where: { detalleVentaId: { in: detailIds } },
          });
          if (r.count > 0) console.log(`  ${table}: ${r.count}`);
        }

        const pasajeros = await tx.pasajerosDetalle.deleteMany({
          where: { detalleVentaId: { in: detailIds } },
        });
        console.log(`  pasajeros_detalle: ${pasajeros.count}`);

        const detalles = await tx.detalleVenta.deleteMany({
          where: { ventaId: { not: KEEP_SALE_ID } },
        });
        console.log(`  detalle_venta: ${detalles.count}`);
      }

      const pagos = await tx.pagosVenta.deleteMany({
        where: { ventaId: { not: KEEP_SALE_ID } },
      });
      console.log(`  pagos_venta: ${pagos.count}`);

      const liqVentas = await tx.liquidacionVentas.deleteMany({
        where: { ventaId: { not: KEEP_SALE_ID } },
      });
      console.log(`  liquidacion_ventas: ${liqVentas.count}`);

      const ventas = await tx.ventas.deleteMany({
        where: { id: { not: KEEP_SALE_ID } },
      });
      console.log(`  ventas: ${ventas.count}`);
    },
    { maxWait: 60000, timeout: 120000 }
  );

  const remaining = await prisma.ventas.count();
  console.log(`\nListo. Ventas restantes en BD: ${remaining}`);
  if (remaining !== 1) {
    throw new Error(`Se esperaba 1 venta; hay ${remaining}.`);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
