const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getEvaluaciones,
    getEvaluacionById,
    createEvaluacion,
    deleteEvaluacion
} = require('../controllers/evaluaciones.controller')

router.get('/', auth, getEvaluaciones)
router.get('/:id', auth, getEvaluacionById)
router.post('/', auth, createEvaluacion)
router.delete('/:id', auth, isAdmin, deleteEvaluacion)

module.exports = router