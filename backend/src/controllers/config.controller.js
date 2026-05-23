const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

const SECTION_MAP = {
  'cards': {
    model: 'tarjetasAgencia', idField: 'id', include: { metodoPago: true },
    transform: (r) => ({ id: r.id, name: r.nombre, paymentMethod: r.metodoPago?.nombre || null, lastFourDigits: r.ultimosCuatro, description: r.descripcion, status: r.status })
  },
  'payment-methods': {
    model: 'metodosPago', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre })
  },
  'document-types': {
    model: 'tiposDocumento', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, abreviatura: r.abreviatura })
  },
  'airlines': {
    model: 'aerolineas', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, code: r.codigoIata, type: r.tipo, website: r.web })
  },
  'suppliers': {
    model: 'proveedores', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, type: r.tipo, email: r.emailContacto, phone: r.telefono, website: r.web })
  },
  'airports': {
    model: 'aeropuertos', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, abbreviation: r.codigoIata, location: [r.ciudad, r.pais].filter(Boolean).join(', '), type: r.tipo, status: r.status })
  },
  'baggage': {
    model: 'politicasEquipaje', idField: 'id', include: { aerolinea: true },
    transform: (r) => ({ id: r.id, airlineName: r.aerolinea?.nombre || null, fareType: r.tipoTarifa, personalItem: r.articuloPersonal, carryOn: r.equipajeMano, checkedBag: r.equipajeBodega, notes: r.notas })
  },
  'packages': {
    model: 'paquetes', idField: 'id',
    include: { paqueteHotel: true, paqueteTarifas: true, paqueteAsistenciaMedica: true, paqueteVuelo: { include: { aerolinea: true } } },
    transform: (r) => ({
      id: r.id,
      name: r.nombre,
      destination: r.destino,
      includedServices: r.serviciosIncluidos,
      notIncluded: r.noIncluido,
      flight: r.paqueteVuelo?.[0] ? {
        airline: r.paqueteVuelo[0].aerolinea?.nombre || null,
        route: r.paqueteVuelo[0].nroVuelo || null
      } : undefined,
      accommodation: r.paqueteHotel?.[0] ? {
        hotel: r.paqueteHotel[0].hotelNombre,
        hotelType: r.paqueteHotel[0].tipoHotel,
        mealPlan: r.paqueteHotel[0].regimen
      } : undefined,
      rates: r.paqueteTarifas?.[0] ? {
        adult: r.paqueteTarifas[0].tarifaAdulto,
        child: r.paqueteTarifas[0].tarifaMenor || 0
      } : undefined,
      medicalAssistance: r.paqueteAsistenciaMedica ? {
        amountUsd: r.paqueteAsistenciaMedica.coberturaUsd,
        coverageDays: r.paqueteAsistenciaMedica.diasCobertura
      } : undefined
    })
  },
};

exports.getAll = async (req, res, next) => {
  try {
    const entries = Object.entries(SECTION_MAP);
    const results = await Promise.all(
      entries.map(([, config]) =>
        prisma[config.model].findMany({ include: config.include || undefined })
      )
    );
    const data = {};
    entries.forEach(([key, config], i) => {
      data[key] = config.transform ? results[i].map(config.transform) : results[i];
    });
    success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.getSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    let sectionData = await prisma[config.model].findMany({
      include: config.include || undefined
    });

    if (config.transform) sectionData = sectionData.map(config.transform);
    success(res, sectionData);
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { section } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    const item = await prisma[config.model].create({
      data: { ...req.body }
    });

    success(res, item, null, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    const item = await prisma[config.model].update({
      where: { [config.idField]: parseInt(id) },
      data: { ...req.body }
    });

    success(res, item);
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    await prisma[config.model].delete({
      where: { [config.idField]: parseInt(id) }
    });

    success(res, { message: 'Elemento eliminado' });
  } catch (err) {
    next(err);
  }
};
