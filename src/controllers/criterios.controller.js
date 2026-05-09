const supabase = require('../config/supabase')

const getCriterios = async (req, res, next) => {
    try {
        const {data, error} = await supabase
            .from('criterios')
            .select('*')

        if (error) return next(error)

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const getCriterioById = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('criterios')
            .select('*')
            .eq('id_criterio', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Criterio con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const createCriterio = async (req, res, next) => {
    try {
        const {descripcion, peso_porcentaje} = req.body

        if (!descripcion || peso_porcentaje === undefined) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos descripcion y peso_porcentaje son requeridos',
                path: req.path
            })
        }

        if (peso_porcentaje <= 0 || peso_porcentaje > 100) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'El peso_porcentaje debe ser mayor a 0 y menor o igual a 100',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('criterios')
            .insert({descripcion, peso_porcentaje})
            .select()
            .single()

        if (error) return next(error)

        res.status(201).json(data)
    } catch (err) {
        next(err)
    }
}

const updateCriterio = async (req, res, next) => {
    try {
        const {id} = req.params
        const {descripcion, peso_porcentaje} = req.body

        if (!descripcion || peso_porcentaje === undefined) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos descripcion y peso_porcentaje son requeridos',
                path: req.path
            })
        }

        if (peso_porcentaje <= 0 || peso_porcentaje > 100) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'El peso_porcentaje debe ser mayor a 0 y menor o igual a 100',
                path: req.path
            })
        }

        const {data, error} = await supabase
            .from('criterios')
            .update({descripcion, peso_porcentaje})
            .eq('id_criterio', id)
            .select()
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Criterio con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteCriterio = async (req, res, next) => {
    try {
        const {id} = req.params

        const {data, error} = await supabase
            .from('criterios')
            .delete()
            .eq('id_criterio', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar el criterio porque está en uso en evaluaciones',
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
                message: `Criterio con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getCriterios,
    getCriterioById,
    createCriterio,
    updateCriterio,
    deleteCriterio
}