const supabase = require('../config/supabase')

const getExposiciones = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0
        const size = parseInt(req.query.size) || 10
        const id_equipo = parseInt(req.query.id_equipo) || null
        const from = page * size
        const to = from + size - 1

        let query = supabase
            .from('exposiciones')
            .select('*', {count: 'exact'})
            .range(from, to)

        if (id_equipo) {
            query = query.eq('id_equipo', id_equipo)
        }

        const {data, count, error} = await query

        if (error) return next(error)

        res.status(200).json({
            content: data,
            page,
            size,
            totalElements: count,
            totalPages: Math.ceil(count / size)
        })
    } catch (err) {
        next(err)
    }
}

const getExposicionById = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('exposiciones')
            .select('*')
            .eq('id_exposicion', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Exposición con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const createExposicion = async (req, res, next) => {
    try {
        const {tema, fecha_programada, id_equipo} = req.body

        if (!tema || !fecha_programada || !id_equipo) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos tema, fecha_programada e id_equipo son requeridos',
                path: req.path
            })
        }

        const {data: equipo} = await supabase
            .from('equipos')
            .select('id_equipo')
            .eq('id_equipo', id_equipo)
            .single()

        if (!equipo) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Equipo con id ${id_equipo} no encontrado`,
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('exposiciones')
            .insert({tema, fecha_programada, id_equipo})
            .select()
            .single()

        if (error) return next(error)

        res.status(201).json(data)
    } catch (err) {
        next(err)
    }
}

const updateExposicion = async (req, res, next) => {
    try {
        const {id} = req.params
        const {tema, fecha_programada, id_equipo} = req.body

        if (!tema || !fecha_programada || !id_equipo) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos tema, fecha_programada e id_equipo son requeridos',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('exposiciones')
            .update({tema, fecha_programada, id_equipo})
            .eq('id_exposicion', id)
            .select()
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Exposición con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteExposicion = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('exposiciones')
            .delete()
            .eq('id_exposicion', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar la exposición porque tiene evaluaciones registradas',
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
                message: `Exposición con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getExposiciones,
    getExposicionById,
    createExposicion,
    updateExposicion,
    deleteExposicion
}