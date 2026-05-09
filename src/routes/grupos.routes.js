const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')
const {
    getGrupos,
    getGrupoById,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    addAlumnoToGrupo,
    removeAlumnoFromGrupo
} = require('../controllers/grupos.controller')

router.get('/',               auth,          getGrupos)
router.get('/:id',            auth,          getGrupoById)
router.post('/',              auth, isAdmin, createGrupo)
router.put('/:id',            auth, isAdmin, updateGrupo)
router.delete('/:id',         auth, isAdmin, deleteGrupo)
router.post('/:id/alumnos',   auth, isAdmin, addAlumnoToGrupo)
router.delete('/:id/alumnos', auth, isAdmin, removeAlumnoFromGrupo)

module.exports = router