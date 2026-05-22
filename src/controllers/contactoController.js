const pool = require('../config/db')

const enviar = async (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body
  try {
    await pool.query(
      'INSERT INTO mensajes (nombre, correo, asunto, mensaje) VALUES ($1,$2,$3,$4)',
      [nombre, correo, asunto, mensaje]
    )
    res.status(201).json({ message: 'Mensaje recibido. Gracias por contactarnos.' })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const getMensajes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mensajes ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const marcarLeido = async (req, res) => {
  try {
    await pool.query('UPDATE mensajes SET leido = true WHERE id = $1', [req.params.id])
    res.json({ message: 'Mensaje marcado como leído' })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

module.exports = { enviar, getMensajes, marcarLeido }