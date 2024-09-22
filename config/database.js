const { Sequelize } = require('sequelize');
require('dotenv').config(); // Cargar las variables de entorno

// Crear una instancia de Sequelize con la URL de la base de datos PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Esto obliga a usar SSL
      rejectUnauthorized: false // Esto es para no rechazar certificados autofirmados
    }
  }
});

module.exports = sequelize;
