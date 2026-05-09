const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getCriterios,
    getCriterioById,
    createCriterio,
    updateCriterio,
    deleteCriterio
} = require('../controllers/criterios.controller')

router.get('/', auth, getCriterios)
router.get('/:id', auth, getCriterioById)
router.post('/', auth, isAdmin, createCriterio)
router.put('/:id', auth, isAdmin, updateCriterio)
router.delete('/:id', auth, isAdmin, deleteCriterio)

module.exports = router