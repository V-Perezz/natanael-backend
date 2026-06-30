const pool = require('../config/db')

const getAll = async (req, res) => {
  try {
    const { categoria } = req.query
    let query = 'SELECT * FROM galeria WHERE 1=1'
    const params = []

    if (categoria) {
      params.push(categoria)
      query += ` AND categoria = $${params.length}`
    }

    query += ' ORDER BY orden ASC, created_at DESC'
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const crear = async (req, res) => {
  const { caption, contexto, ubicacion, fecha, categoria, tall, orden } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : null

  try {
    const result = await pool.query(
      `INSERT INTO galeria (caption, contexto, ubicacion, fecha, categoria, imagen, tall, orden)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [caption, contexto, ubicacion, fecha, categoria, imagen, tall || false, orden || 0]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const eliminar = async (req, res) => {
  try {
    await pool.query('DELETE FROM galeria WHERE id = $1', [req.params.id])
    res.json({ message: 'Imagen eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const actualizar = async (req, res) => {
  const { caption, contexto, ubicacion, fecha, categoria, tall, orden } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : undefined

  try {
    const fields = ['caption=$2','contexto=$3','ubicacion=$4','fecha=$5',
                    'categoria=$6','tall=$7','orden=$8']
    const values = [req.params.id, caption, contexto, ubicacion, fecha, categoria, tall, orden]

    if (imagen) {
      fields.push(`imagen=$${values.length + 1}`)
      values.push(imagen)
    }

    const result = await pool.query(
      `UPDATE galeria SET ${fields.join(',')} WHERE id=$1 RETURNING *`,
      values
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

module.exports = { getAll, crear, actualizar, eliminar }