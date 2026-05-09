const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    addAlumnoToEquipo,
    removeAlumnoFromEquipo
} = require('../controllers/equipos.controller')

router.get('/', auth, getEquipos)
router.get('/:id', auth, getEquipoById)
router.post('/', auth, isAdmin, createEquipo)
router.put('/:id', auth, isAdmin, updateEquipo)
router.delete('/:id', auth, isAdmin, deleteEquipo)
router.post('/:id/alumnos', auth, isAdmin, addAlumnoToEquipo)
router.delete('/:id/alumnos', auth, isAdmin, removeAlumnoFromEquipo)

module.exports = router