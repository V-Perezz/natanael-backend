const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/galeriaController')
const { verificarToken } = require('../middlewares/auth')
const upload = require('../middlewares/upload')

router.get('/',       ctrl.getAll)
router.post('/',      verificarToken, upload.single('imagen'), ctrl.crear)
router.delete('/:id', verificarToken, ctrl.eliminar)

module.exports = router