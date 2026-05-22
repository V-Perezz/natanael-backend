const pool = require('../config/db')

const getAll = async (req, res) => {
  try {
    const { categoria, destacado } = req.query
    let query = 'SELECT * FROM proyectos WHERE 1=1'
    const params = []

    if (categoria) {
      params.push(categoria)
      query += ` AND categoria = $${params.length}`
    }
    if (destacado !== undefined) {
      params.push(destacado === 'true')
      query += ` AND destacado = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const crear = async (req, res) => {
  const { titulo, categoria, descripcion, ubicacion, beneficiarios, fecha, destacado } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : null

  try {
    const result = await pool.query(
      `INSERT INTO proyectos (titulo, categoria, descripcion, imagen, ubicacion, beneficiarios, fecha, destacado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [titulo, categoria, descripcion, imagen, ubicacion, beneficiarios, fecha, destacado || false]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const actualizar = async (req, res) => {
  const { titulo, categoria, descripcion, ubicacion, beneficiarios, fecha, destacado } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : undefined

  try {
    const fields = ['titulo=$2','categoria=$3','descripcion=$4','ubicacion=$5',
                    'beneficiarios=$6','fecha=$7','destacado=$8']
    const values = [req.params.id, titulo, categoria, descripcion, ubicacion,
                    beneficiarios, fecha, destacado]

    if (imagen) {
      fields.push(`imagen=$${values.length + 1}`)
      values.push(imagen)
    }

    const result = await pool.query(
      `UPDATE proyectos SET ${fields.join(',')} WHERE id=$1 RETURNING *`,
      values
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const eliminar = async (req, res) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id = $1', [req.params.id])
    res.json({ message: 'Proyecto eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

module.exports = { getAll, crear, actualizar, eliminar }