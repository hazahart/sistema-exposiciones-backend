const supabase = require('../config/supabase')

const getMaterias = async (req, res, next) => {
    try {
        const page   = parseInt(req.query.page)  || 0
        const size   = parseInt(req.query.size)  || 10
        const nombre = req.query.nombre || ''

        const from = page * size
        const to   = from + size - 1

        let query = supabase
            .from('materias')
            .select('*', { count: 'exact' })
            .range(from, to)

        if (nombre) {
            query = query.ilike('nombre_materia', `%${nombre}%`)
        }

        const { data, count, error } = await query

        if (error) return next(error)

        res.status(200).json({
            content:       data,
            page:          page,
            size:          size,
            totalElements: count,
            totalPages:    Math.ceil(count / size)
        })
    } catch (err) {
        next(err)
    }
}

const getMateriaById = async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('materias')
            .select('*')
            .eq('id_materia', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Materia con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const createMateria = async (req, res, next) => {
    try {
        const { clave_materia, nombre_materia } = req.body

        if (!clave_materia || !nombre_materia) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos clave_materia y nombre_materia son requeridos',
                path: req.path
            })
        }

        const { data, error } = await supabase
            .from('materias')
            .insert({ clave_materia, nombre_materia })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'Ya existe una materia con esa clave',
                    path: req.path
                })
            }
            return next(error)
        }

        res.status(201).json(data)
    } catch (err) {
        next(err)
    }
}

const updateMateria = async (req, res, next) => {
    try {
        const { id } = req.params
        const { clave_materia, nombre_materia } = req.body

        if (!clave_materia || !nombre_materia) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos clave_materia y nombre_materia son requeridos',
                path: req.path
            })
        }

        const { data, error } = await supabase
            .from('materias')
            .update({ clave_materia, nombre_materia })
            .eq('id_materia', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'Ya existe una materia con esa clave',
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
                message: `Materia con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteMateria = async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('materias')
            .delete()
            .eq('id_materia', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar la materia porque tiene grupos asociados',
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
                message: `Materia con id ${id} no encontrada`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getMaterias,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
}