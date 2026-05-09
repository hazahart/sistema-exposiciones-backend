const supabase = require('../config/supabase')

const getEvaluaciones = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0
        const size = parseInt(req.query.size) || 10
        const id_exposicion = parseInt(req.query.id_exposicion) || null
        const id_alumno_evaluador = parseInt(req.query.id_alumno_evaluador) || null
        const from = page * size
        const to = from + size - 1

        let query = supabase
            .from('evaluaciones')
            .select(`
        id_evaluacion,
        id_exposicion,
        id_alumno_evaluador,
        fecha_registro,
        calificacion_final,
        evaluacion_detalles (
          id_criterio,
          calificacion,
          criterios ( descripcion, peso_porcentaje )
        )
      `, {count: 'exact'})
            .range(from, to)

        if (id_exposicion) query = query.eq('id_exposicion', id_exposicion)
        if (id_alumno_evaluador) query = query.eq('id_alumno_evaluador', id_alumno_evaluador)

        const {data, count, error} = await query

        if (error) return next(error)

        const content = data.map(e => ({
            id_evaluacion: e.id_evaluacion,
            id_exposicion: e.id_exposicion,
            id_alumno_evaluador: e.id_alumno_evaluador,
            fecha_registro: e.fecha_registro,
            calificacion_final: e.calificacion_final,
            detalles: e.evaluacion_detalles.map(d => ({
                id_criterio: d.id_criterio,
                descripcion: d.criterios.descripcion,
                peso_porcentaje: d.criterios.peso_porcentaje,
                calificacion: d.calificacion
            }))
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

const getEvaluacionById = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('evaluaciones')
            .select(`
        id_evaluacion,
        id_exposicion,
        id_alumno_evaluador,
        fecha_registro,
        calificacion_final,
        evaluacion_detalles (
          id_criterio,
          calificacion,
          criterios ( descripcion, peso_porcentaje )
        )
      `)
            .eq('id_evaluacion', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Evaluación con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(200).json({
            id_evaluacion: data.id_evaluacion,
            id_exposicion: data.id_exposicion,
            id_alumno_evaluador: data.id_alumno_evaluador,
            fecha_registro: data.fecha_registro,
            calificacion_final: data.calificacion_final,
            detalles: data.evaluacion_detalles.map(d => ({
                id_criterio: d.id_criterio,
                descripcion: d.criterios.descripcion,
                peso_porcentaje: d.criterios.peso_porcentaje,
                calificacion: d.calificacion
            }))
        })
    } catch (err) {
        next(err)
    }
}

const createEvaluacion = async (req, res, next) => {
    try {
        const {id_exposicion, id_alumno_evaluador, detalles} = req.body

        if (!id_exposicion || !id_alumno_evaluador || !detalles || detalles.length === 0) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos id_exposicion, id_alumno_evaluador y detalles son requeridos',
                path: req.path
            })
        }

        const {data: exposicion} = await supabase
            .from('exposiciones')
            .select('id_exposicion, id_equipo')
            .eq('id_exposicion', id_exposicion)
            .single()

        if (!exposicion) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Exposición con id ${id_exposicion} no encontrada`,
                path: req.path
            })
        }

        const {data: integrante} = await supabase
            .from('equipo_alumnos')
            .select('id_alumno')
            .eq('id_equipo', exposicion.id_equipo)
            .eq('id_alumno', id_alumno_evaluador)
            .single()

        if (integrante) {
            return res.status(403).json({
                timestamp: new Date().toISOString(),
                status: 403,
                error: 'Forbidden',
                message: 'No puedes evaluar una exposición de tu propio equipo',
                path: req.path
            })
        }

        const idsCriterios = detalles.map(d => d.id_criterio)
        const {data: criterios} = await supabase
            .from('criterios')
            .select('id_criterio, peso_porcentaje')
            .in('id_criterio', idsCriterios)

        if (!criterios || criterios.length !== idsCriterios.length) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Uno o más criterios no existen',
                path: req.path
            })
        }

        const calificacion_final = detalles.reduce((total, detalle) => {
            const criterio = criterios.find(c => c.id_criterio === detalle.id_criterio)
            return total + (detalle.calificacion * criterio.peso_porcentaje / 100)
        }, 0)

        const {data: evaluacion, error: evalError} = await supabase
            .from('evaluaciones')
            .insert({id_exposicion, id_alumno_evaluador, calificacion_final: parseFloat(calificacion_final.toFixed(2))})
            .select()
            .single()

        if (evalError) {
            if (evalError.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'Ya registraste una evaluación para esta exposición',
                    path: req.path
                })
            }
            return next(evalError)
        }

        const detallesInsert = detalles.map(d => ({
            id_evaluacion: evaluacion.id_evaluacion,
            id_criterio: d.id_criterio,
            calificacion: d.calificacion
        }))

        const {error: detallesError} = await supabase
            .from('evaluacion_detalles')
            .insert(detallesInsert)

        if (detallesError) return next(detallesError)

        res.status(201).json({
            id_evaluacion: evaluacion.id_evaluacion,
            id_exposicion: evaluacion.id_exposicion,
            id_alumno_evaluador: evaluacion.id_alumno_evaluador,
            fecha_registro: evaluacion.fecha_registro,
            calificacion_final: evaluacion.calificacion_final,
            detalles: detalles.map(d => {
                const criterio = criterios.find(c => c.id_criterio === d.id_criterio)
                return {
                    id_criterio: d.id_criterio,
                    peso_porcentaje: criterio.peso_porcentaje,
                    calificacion: d.calificacion
                }
            })
        })
    } catch (err) {
        next(err)
    }
}

const deleteEvaluacion = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('evaluaciones')
            .delete()
            .eq('id_evaluacion', id)
            .select()
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Evaluación con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getEvaluaciones,
    getEvaluacionById,
    createEvaluacion,
    deleteEvaluacion
}