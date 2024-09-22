const Usuario = require('./Usuario'); // Asegúrate de que la ruta es correcta
const bcrypt = require('bcrypt');
const config = require('../config/config'); // Asegúrate de que la configuración sea correcta

async function crearAdmin() {
  try {
    // Buscar si el usuario administrador ya existe
    const admin = await Usuario.findOne({ where: { email: config.adminEmail } });

    if (!admin) {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(config.adminPassword, 10);

      // Crear el usuario administrador
      await Usuario.create({
        nombre: 'Manuel Fernández',
        email: config.adminEmail,
        password: hashedPassword,
        rol: config.adminRole, // Asignar el rol de psicólogo
      });

      console.log('Usuario administrador creado: ', config.adminEmail);
    } else {
      console.log('El usuario administrador ya existe.');
    }
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  }
}

module.exports = crearAdmin;