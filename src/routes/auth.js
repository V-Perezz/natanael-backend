const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verificarToken } = require('../middlewares/auth')

router.post('/login',   authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout',  authController.logout)
router.get('/perfil',   verificarToken, authController.perfil)

module.exports = router