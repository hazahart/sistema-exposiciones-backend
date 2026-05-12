const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getAlumnos,
    getAlumnoById,
    createAlumno,
    updateAlumno,
    deleteAlumno,
    getStudentStats // Importamos la nueva función
} = require('../controllers/alumnos.controller')

// --- Rutas de Información ---

// IMPORTANTE: Esta ruta debe ir antes de /:id
router.get('/stats/dashboard', auth, getStudentStats)

// --- Rutas CRUD ---

router.get('/', auth, getAlumnos)
router.get('/:id', auth, getAlumnoById)
router.post('/', auth, isAdmin, createAlumno)
router.put('/:id', auth, isAdmin, updateAlumno)
router.delete('/:id', auth, isAdmin, deleteAlumno)

module.exports = router