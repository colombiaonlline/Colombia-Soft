const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza de usuarios y clientes...');
  try {
    // 1. Truncar clientes
    console.log('Eliminando clientes y reiniciando secuencia de IDs...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;');

    // 2. Obtener datos del admin existente para conservarlos
    const adminUser = await prisma.usuarios.findFirst({
      where: {
        rol: {
          nombre: 'admin'
        }
      },
      include: {
        persona: true,
        permisosUsuario: true
      }
    });

    if (!adminUser) {
      throw new Error('No se encontró un usuario administrador con rol "admin" para respaldar.');
    }

    console.log('Respaldando datos del administrador:', adminUser.email);

    // 3. Truncar usuarios y personas
    console.log('Eliminando todos los usuarios y personas, y reiniciando secuencias...');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE usuarios, personas RESTART IDENTITY CASCADE;');

    // 4. Recrear la persona para el admin (ID 1)
    console.log('Recreando persona del administrador...');
    const newPersona = await prisma.personas.create({
      data: {
        nombres: adminUser.persona.nombres,
        apellidos: adminUser.persona.apellidos,
        tipoDocumentoId: adminUser.persona.tipoDocumentoId,
        documento: adminUser.persona.documento,
        email: adminUser.persona.email,
        telefono: adminUser.persona.telefono,
        birthDate: adminUser.persona.birthDate,
        avatarUrl: adminUser.persona.avatarUrl,
        status: adminUser.persona.status
      }
    });

    // 5. Recrear el usuario admin (ID 1)
    console.log('Recreando usuario del administrador...');
    const newAdmin = await prisma.usuarios.create({
      data: {
        personaId: newPersona.id,
        email: adminUser.email,
        passwordHash: adminUser.passwordHash,
        rolId: adminUser.rolId,
        status: adminUser.status
      }
    });

    // 6. Restaurar permisos específicos de usuario si existían
    if (adminUser.permisosUsuario && adminUser.permisosUsuario.length > 0) {
      console.log('Restaurando permisos específicos del administrador...');
      await prisma.permisosUsuario.createMany({
        data: adminUser.permisosUsuario.map(p => ({
          usuarioId: newAdmin.id,
          permisoId: p.permisoId,
          permitido: p.permitido,
          valor: p.valor
        }))
      });
    }

    console.log('\n¡Éxito!');
    console.log('- Clientes eliminados y secuencia de IDs reiniciada.');
    console.log('- Todos los usuarios eliminados (excepto el administrador).');
    console.log('- Secuencias de personas y usuarios reiniciadas.');
    console.log(`- Administrador (${newAdmin.email}) recreado con ID ${newAdmin.id} y Persona ID ${newPersona.id}.`);

  } catch (error) {
    console.error('Error durante la ejecución del script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
