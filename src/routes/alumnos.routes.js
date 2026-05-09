const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getAlumnos,
    getAlumnoById,
    createAlumno,
    updateAlumno,
    deleteAlumno
} = require('../controllers/alumnos.controller')

router.get('/', auth, getAlumnos)
router.get('/:id', auth, getAlumnoById)
router.post('/', auth, isAdmin, createAlumno)
router.put('/:id', auth, isAdmin, updateAlumno)
router.delete('/:id', auth, isAdmin, deleteAlumno)

module.exports = router