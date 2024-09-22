const Cita = require('../models/Cita');

exports.guardarCita = async (req, res) => {
  try {
    const { fecha, hora, usuarioId } = req.body;

    // Crear la nueva cita en la base de datos
    const nuevaCita = await Cita.create({ fecha, hora, usuarioId });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error('Error al guardar la cita:', error);
    res.status(500).json({ message: 'Error al guardar la cita' });
  }
};
