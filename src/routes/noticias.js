const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/noticiasController')
const { verificarToken } = require('../middlewares/auth')
const upload = require('../middlewares/upload')

router.get('/',       ctrl.getAll)
router.get('/:slug',  ctrl.getOne)
router.post('/',      verificarToken, upload.single('imagen'), ctrl.crear)
router.put('/:id',    verificarToken, upload.single('imagen'), ctrl.actualizar)
router.delete('/:id', verificarToken, ctrl.eliminar)

module.exports = router