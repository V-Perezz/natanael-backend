const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/contactoController')
const { verificarToken } = require('../middlewares/auth')

router.post('/',         ctrl.enviar)
router.get('/mensajes',  verificarToken, ctrl.getMensajes)
router.put('/:id/leido', verificarToken, ctrl.marcarLeido)

module.exports = router