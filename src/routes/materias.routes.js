const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
    getMaterias,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
} = require('../controllers/materias.controller')

router.get('/',     auth, getMaterias)
router.get('/:id',  auth, getMateriaById)
router.post('/',    auth, createMateria)
router.put('/:id',  auth, updateMateria)
router.delete('/:id', auth, deleteMateria)

module.exports = router