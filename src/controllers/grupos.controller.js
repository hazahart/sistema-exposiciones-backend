const supabase = require('../config/supabase')

const getGrupos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0
        const size = parseInt(req.query.size) || 10
        const from = page * size
        const to = from + size - 1

        const {data, count, error} = await supabase
            .from('grupos')
            .select(`
        id_grupo,
        nombre_grupo,
        id_materia,
        grupo_alumnos (
          alumnos ( id_alumno, matricula, nombre, correo, rol )
        )
      `, {count: 'exact'})
            .range(from, to)

        if (error) return next(error)

        const content = data.map(g => ({
            id_grupo: g.id_grupo,
            nombre_grupo: g.nombre_grupo,
            id_materia: g.id_materia,
            alumnos: g.grupo_alumnos.map(ga => ga.alumnos)
        }))

        res.status(200).json({
            content,
            page,
            size,
            totalElements: count,
            totalPages: Math.ceil(count / size)
        })
    } catch (err) {
        next(err)
    }
}

const getGrupoById = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('grupos')
            .select(`
        id_grupo,
        nombre_grupo,
        id_materia,
        grupo_alumnos (
          alumnos ( id_alumno, matricula, nombre, correo, rol )
        )
      `)
            .eq('id_grupo', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Grupo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json({
            id_grupo: data.id_grupo,
            nombre_grupo: data.nombre_grupo,
            id_materia: data.id_materia,
            alumnos: data.grupo_alumnos.map(ga => ga.alumnos)
        })
    } catch (err) {
        next(err)
    }
}

const createGrupo = async (req, res, next) => {
    try {
        const {nombre_grupo, id_materia} = req.body

        if (!nombre_grupo || !id_materia) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos nombre_grupo e id_materia son requeridos',
                path: req.path
            })
        }

        const {data: materia} = await supabase
            .from('materias')
            .select('id_materia')
            .eq('id_materia', id_materia)
            .single()

        if (!materia) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Materia con id ${id_materia} no encontrada`,
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('grupos')
            .insert({nombre_grupo, id_materia})
            .select()
            .single()

        if (error) return next(error)

        res.status(201).json({...data, alumnos: []})
    } catch (err) {
        next(err)
    }
}

const updateGrupo = async (req, res, next) => {
    try {
        const {id} = req.params
        const {nombre_grupo, id_materia} = req.body

        if (!nombre_grupo || !id_materia) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos nombre_grupo e id_materia son requeridos',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('grupos')
            .update({nombre_grupo, id_materia})
            .eq('id_grupo', id)
            .select()
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Grupo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteGrupo = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('grupos')
            .delete()
            .eq('id_grupo', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar el grupo porque tiene equipos asociados',
                    path: req.path
                })
            }
            return next(error)
        }

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Grupo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

const addAlumnoToGrupo = async (req, res, next) => {
    try {
        const {id} = req.params
        const {id_alumno} = req.body

        if (!id_alumno) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'El campo id_alumno es requerido',
                path: req.path
            })
        }

        const {data: grupo} = await supabase
            .from('grupos')
            .select('id_grupo')
            .eq('id_grupo', id)
            .single()

        if (!grupo) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Grupo con id ${id} no encontrado`,
                path: req.path
            })
        }

        const {data: alumno} = await supabase
            .from('alumnos')
            .select('id_alumno')
            .eq('id_alumno', id_alumno)
            .single()

        if (!alumno) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Alumno con id ${id_alumno} no encontrado`,
                path: req.path
            })
        }

        const {error} = await supabase
            .from('grupo_alumnos')
            .insert({id_grupo: id, id_alumno})

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'El alumno ya está inscrito en este grupo',
                    path: req.path
                })
            }
            return next(error)
        }

        res.status(201).send()
    } catch (err) {
        next(err)
    }
}

const removeAlumnoFromGrupo = async (req, res, next) => {
    try {
        const {id} = req.params
        const {id_alumno} = req.body

        if (!id_alumno) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'El campo id_alumno es requerido',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('grupo_alumnos')
            .delete()
            .eq('id_grupo', id)
            .eq('id_alumno', id_alumno)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: 'El alumno no está inscrito en este grupo',
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getGrupos,
    getGrupoById,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    addAlumnoToGrupo,
    removeAlumnoFromGrupo
}