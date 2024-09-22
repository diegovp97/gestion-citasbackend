const express = require('express');
const http = require('http');
const WebSocket = require('ws'); // Requiere el paquete WebSocket
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database'); // Importa tu configuración de base de datos
const crearAdmin = require('./models/initAdmin'); // Inicializa el usuario administrador
const Usuario = require('./models/Usuario');
const Cita = require('./models/Cita');

// Clave secreta JWT de 40 caracteres
const jwtSecret = 'abcdefghijklmnopqrstuvwxyz0123456789abcd'; // Cambia esto por tu clave de 40 caracteres

// Definir las relaciones entre los modelos
Usuario.hasMany(Cita, { foreignKey: 'pacienteId' });
Cita.belongsTo(Usuario, { foreignKey: 'pacienteId' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Crear el servidor HTTP
const server = http.createServer(app);

// Crear el servidor WebSocket
const wss = new WebSocket.Server({ server });

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ error: 'No se proporcionó un token' });
  }

  const token = authHeader.split(' ')[1];  // Obtener el token después de "Bearer"

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.usuario = decoded;  // Agregar el usuario decodificado al request
    next();
  });
};

// Función para notificar a los clientes WebSocket
const notificarClientesCitas = async () => {
  const citas = await Cita.findAll();
  const citasData = JSON.stringify(citas);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(citasData); // Enviar las citas a todos los clientes conectados
    }
  });
};

// Cuando un cliente se conecta al WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  
  // Enviar citas iniciales al cliente
  notificarClientesCitas();
  
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

// Rutas para crear usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password } = req.body;
  
  try {
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Intenta crear el usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword
    });
    
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Error al crear el usuario: ', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Ruta de autenticación (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta protegida para obtener citas
app.get('/api/citas', verificarToken, async (req, res) => {
  try {
    const citas = await Cita.findAll(); // Obtener todas las citas
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// Ruta protegida para crear cita
app.post('/api/citas', verificarToken, async (req, res) => {
  const { fecha, hora, pacienteId } = req.body;

  if (!fecha || !hora || !pacienteId) {
    return res.status(400).json({ error: 'La fecha, la hora y el pacienteId son obligatorios' });
  }

  try {
    const cita = await Cita.create({
      fecha,
      hora,
      pacienteId,
      estado: 'pendiente'
    });
    
    // Notificar a los clientes conectados cuando se crea una nueva cita
    notificarClientesCitas();

    res.json(cita);
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});

// Inicializa el usuario administrador
crearAdmin(); 

// Sincroniza la base de datos y levanta el servidor
const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });
