const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const generarTokens = (usuario) => {
  const payload = { id: usuario.id, correo: usuario.correo, rol: usuario.rol }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  })

  return { accessToken, refreshToken }
}

const login = async (req, res) => {
  const { correo, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1 AND activo = true',
      [correo]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const usuario = result.rows[0]
    const passwordOk = await bcrypt.compare(password, usuario.password)

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const { accessToken, refreshToken } = generarTokens(usuario)

    // Guardar refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (usuario_id, token, expires_at) VALUES ($1, $2, $3)',
      [usuario.id, refreshToken, expiresAt]
    )

    res.json({
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
}

const refresh = async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token requerido' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token inválido o expirado' })
    }

    const usuarioResult = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    )

    if (usuarioResult.rows.length === 0) {
      return res.status(403).json({ error: 'Usuario no encontrado' })
    }

    const { accessToken, refreshToken: newRefreshToken } = generarTokens(usuarioResult.rows[0])

    // Rotar el refresh token
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (usuario_id, token, expires_at) VALUES ($1, $2, $3)',
      [decoded.id, newRefreshToken, expiresAt]
    )

    res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' })
  }
}

const logout = async (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
  }
  res.json({ message: 'Sesión cerrada' })
}

const perfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
}

module.exports = { login, refresh, logout, perfil }