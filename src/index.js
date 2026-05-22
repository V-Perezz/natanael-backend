require('dotenv').config()
const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')
const path      = require('path')

const app = express()

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

// Rate limiting
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta en 15 minutos.' }
}))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}))

// Body parser
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true }))

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rutas
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/noticias',  require('./routes/noticias'))
app.use('/api/proyectos', require('./routes/proyectos'))
app.use('/api/galeria',   require('./routes/galeria'))
app.use('/api/contacto',  require('./routes/contacto'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Manejo de errores de Multer y generales
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'La imagen es demasiado grande. Máximo permitido: 20MB'
    })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Tipo de archivo no permitido' })
  }
  console.error(err)
  res.status(500).json({ error: 'Error del servidor' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})