const supabase = require('../config/supabase')

const getEquipos = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0
        const size = parseInt(req.query.size) || 10
        const from = page * size
        const to = from + size - 1

        const {data, count, error} = await supabase
            .from('equipos')
            .select(`
        id_equipo,
        nombre_equipo,
        id_grupo,
        equipo_alumnos (
          alumnos ( id_alumno, matricula, nombre, correo, rol )
        )
      `, {count: 'exact'})
            .range(from, to)

        if (error) return next(error)

        const content = data.map(e => ({
            id_equipo: e.id_equipo,
            nombre_equipo: e.nombre_equipo,
            id_grupo: e.id_grupo,
            alumnos: e.equipo_alumnos.map(ea => ea.alumnos)
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

const getEquipoById = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('equipos')
            .select(`
        id_equipo,
        nombre_equipo,
        id_grupo,
        equipo_alumnos (
          alumnos ( id_alumno, matricula, nombre, correo, rol )
        )
      `)
            .eq('id_equipo', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Equipo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json({
            id_equipo: data.id_equipo,
            nombre_equipo: data.nombre_equipo,
            id_grupo: data.id_grupo,
            alumnos: data.equipo_alumnos.map(ea => ea.alumnos)
        })
    } catch (err) {
        next(err)
    }
}

const createEquipo = async (req, res, next) => {
    try {
        const {nombre_equipo, id_grupo} = req.body

        if (!nombre_equipo || !id_grupo) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos nombre_equipo e id_grupo son requeridos',
                path: req.path
            })
        }

        const {data: grupo} = await supabase
            .from('grupos')
            .select('id_grupo')
            .eq('id_grupo', id_grupo)
            .single()

        if (!grupo) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Grupo con id ${id_grupo} no encontrado`,
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('equipos')
            .insert({nombre_equipo, id_grupo})
            .select()
            .single()

        if (error) return next(error)

        res.status(201).json({...data, alumnos: []})
    } catch (err) {
        next(err)
    }
}

const updateEquipo = async (req, res, next) => {
    try {
        const {id} = req.params
        const {nombre_equipo, id_grupo} = req.body

        if (!nombre_equipo || !id_grupo) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos nombre_equipo e id_grupo son requeridos',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('equipos')
            .update({nombre_equipo, id_grupo})
            .eq('id_equipo', id)
            .select()
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Equipo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteEquipo = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('equipos')
            .delete()
            .eq('id_equipo', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar el equipo porque tiene exposiciones asociadas',
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
                message: `Equipo con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

const addAlumnoToEquipo = async (req, res, next) => {
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

        const {data: equipo} = await supabase
            .from('equipos')
            .select('id_equipo')
            .eq('id_equipo', id)
            .single()

        if (!equipo) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Equipo con id ${id} no encontrado`,
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
            .from('equipo_alumnos')
            .insert({id_equipo: id, id_alumno})

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'El alumno ya pertenece a este equipo',
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

const removeAlumnoFromEquipo = async (req, res, next) => {
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
            .from('equipo_alumnos')
            .delete()
            .eq('id_equipo', id)
            .eq('id_alumno', id_alumno)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: 'El alumno no pertenece a este equipo',
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    addAlumnoToEquipo,
    removeAlumnoFromEquipo
}