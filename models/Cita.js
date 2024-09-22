const { DataTypes } = require('sequelize');  // Asegúrate de importar DataTypes
const sequelize = require('../config/database');  // Importa la configuración de tu base de datos

const Citas = sequelize.define('Citas', {
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'pacienteId'  // Asegúrate de mapear al campo correcto en la base de datos
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'pendiente'
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true  // Asegúrate de que este campo sea obligatorio
  }
});

module.exports = Citas;  // Exporta el modelo para usarlo en otras partes de la aplicación