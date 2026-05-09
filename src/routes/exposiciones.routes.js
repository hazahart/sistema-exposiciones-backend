const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getExposiciones,
    getExposicionById,
    createExposicion,
    updateExposicion,
    deleteExposicion
} = require('../controllers/exposiciones.controller')

router.get('/', auth, getExposiciones)
router.get('/:id', auth, getExposicionById)
router.post('/', auth, isAdmin, createExposicion)
router.put('/:id', auth, isAdmin, updateExposicion)
router.delete('/:id', auth, isAdmin, deleteExposicion)

module.exports = router