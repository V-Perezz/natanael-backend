const pool = require('../config/db')

const slugify = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

const getAll = async (req, res) => {
  try {
    const { publicado, categoria, limit = 20, offset = 0 } = req.query
    let query = 'SELECT * FROM noticias WHERE 1=1'
    const params = []

    if (publicado !== undefined) {
      params.push(publicado === 'true')
      query += ` AND publicado = $${params.length}`
    }
    if (categoria) {
      params.push(categoria)
      query += ` AND categoria = $${params.length}`
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const getOne = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM noticias WHERE slug = $1',
      [req.params.slug]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const crear = async (req, res) => {
  const { titulo, resumen, contenido, categoria, publicado } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : null

  try {
    let slug = slugify(titulo)
    const existe = await pool.query('SELECT id FROM noticias WHERE slug = $1', [slug])
    if (existe.rows.length > 0) slug = slug + '-' + Date.now()

    const result = await pool.query(
      `INSERT INTO noticias (titulo, slug, resumen, contenido, imagen, categoria, publicado)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [titulo, slug, resumen, contenido, imagen, categoria, publicado || false]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const actualizar = async (req, res) => {
  const { titulo, resumen, contenido, categoria, publicado } = req.body
  const imagen = req.file ? `/uploads/${req.file.filename}` : undefined

  try {
    const fields = ['titulo=$2', 'resumen=$3', 'contenido=$4', 'categoria=$5',
                    'publicado=$6', 'updated_at=NOW()']
    const values = [req.params.id, titulo, resumen, contenido, categoria, publicado]

    if (imagen) {
      fields.push(`imagen=$${values.length + 1}`)
      values.push(imagen)
    }

    const result = await pool.query(
      `UPDATE noticias SET ${fields.join(',')} WHERE id=$1 RETURNING *`,
      values
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const eliminar = async (req, res) => {
  try {
    await pool.query('DELETE FROM noticias WHERE id = $1', [req.params.id])
    res.json({ message: 'Noticia eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

module.exports = { getAll, getOne, crear, actualizar, eliminar }