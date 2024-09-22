require('dotenv').config(); // Cargar las variables de entorno del archivo .env

module.exports = {
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminRole: process.env.ADMIN_ROLE,
};
