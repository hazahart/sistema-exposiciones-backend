const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getMaterias,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
} = require('../controllers/materias.controller')

router.get('/', auth, getMaterias)
router.get('/:id', auth, getMateriaById)
router.post('/', auth, isAdmin, createMateria)
router.put('/:id', auth, isAdmin, updateMateria)
router.delete('/:id', auth, isAdmin, deleteMateria)

module.exports = router