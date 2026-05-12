const bcrypt = require('bcryptjs')
const supabase = require('../config/supabase')

const getAlumnos = async (req, res, next) => {
    try {
        const page   = parseInt(req.query.page) || 0
        const size   = parseInt(req.query.size) || 10
        const nombre = req.query.nombre || ''

        const from = page * size
        const to   = from + size - 1

        let query = supabase
            .from('alumnos')
            .select('id_alumno, matricula, nombre, correo, rol', { count: 'exact' })
            .range(from, to)

        if (nombre) {
            query = query.ilike('nombre', `%${nombre}%`)
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

const getAlumnoById = async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('alumnos')
            .select('id_alumno, matricula, nombre, correo, rol')
            .eq('id_alumno', id)
            .single()

        if (error || !data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Alumno con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const createAlumno = async (req, res, next) => {
    try {
        const { matricula, nombre, correo, password, rol = 'alumno' } = req.body

        if (!matricula || !nombre || !password) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos matricula, nombre y password son requeridos',
                path: req.path
            })
        }

        if (!['admin', 'alumno'].includes(rol)) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'El rol debe ser admin o alumno',
                path: req.path
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const { data, error } = await supabase
            .from('alumnos')
            .insert({ matricula, nombre, correo, password: hashedPassword, rol })
            .select('id_alumno, matricula, nombre, correo, rol')
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'Ya existe un alumno con esa matrícula o correo',
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

const updateAlumno = async (req, res, next) => {
    try {
        const { id } = req.params
        const { nombre, correo, password, rol } = req.body

        const updates = {}
        if (nombre)  updates.nombre = nombre
        if (correo)  updates.correo = correo
        if (rol)     updates.rol    = rol
        if (password) updates.password = await bcrypt.hash(password, 10)

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Debes enviar al menos un campo para actualizar',
                path: req.path
            })
        }

        const { data, error } = await supabase
            .from('alumnos')
            .update(updates)
            .eq('id_alumno', id)
            .select('id_alumno, matricula, nombre, correo, rol')
            .single()

        if (error) return next(error)

        if (!data) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                status: 404,
                error: 'Not Found',
                message: `Alumno con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}

const deleteAlumno = async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('alumnos')
            .delete()
            .eq('id_alumno', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23503') {
                return res.status(409).json({
                    timestamp: new Date().toISOString(),
                    status: 409,
                    error: 'Conflict',
                    message: 'No se puede eliminar el alumno porque tiene evaluaciones registradas',
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
                message: `Alumno con id ${id} no encontrado`,
                path: req.path
            })
        }

        res.status(204).send()
    } catch (err) {
        next(err)
    }
}

// Nueva función para las estadísticas del Dashboard mejorada
const getStudentStats = async (req, res, next) => {
    try {
        // SEGURIDAD: Intentamos obtener el ID de varias fuentes para evitar el error 500
        // Si req.user no existe o no tiene ID, lanzamos un 401 en lugar de romper el servidor
        const id_alumno = req.alumno?.id_alumno || req.alumno?.id || req.alumno?.sub;

        if (!id_alumno) {
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                status: 401,
                error: 'Unauthorized',
                message: 'No se pudo identificar al alumno a través del token proporcionado',
                path: req.path
            });
        }

        console.log(`Obteniendo estadísticas para el alumno ID: ${id_alumno}`);

        // 1. Materias (Inscritas en la tabla grupo_alumnos)
        const { count: totalMaterias, error: errMaterias } = await supabase
            .from('grupo_alumnos')
            .select('*', { count: 'exact', head: true })
            .eq('id_alumno', id_alumno);

        if (errMaterias) throw errMaterias;

        // 2. Obtener los IDs de los equipos a los que pertenece el alumno
        const { data: equipos, error: errEquipos } = await supabase
            .from('equipo_alumnos')
            .select('id_equipo')
            .eq('id_alumno', id_alumno);

        if (errEquipos) throw errEquipos;

        const idsEquipos = equipos ? equipos.map(e => e.id_equipo) : [];

        // 3. Exposiciones (Solo si el alumno pertenece a algún equipo)
        let totalExpos = 0;
        let proximas = [];

        if (idsEquipos.length > 0) {
            // Contar exposiciones totales del equipo
            const { count: countExpos, error: errExpos } = await supabase
                .from('exposiciones')
                .select('*', { count: 'exact', head: true })
                .in('id_equipo', idsEquipos);
            
            if (errExpos) throw errExpos;
            totalExpos = countExpos;

            // Obtener las 3 exposiciones más próximas (futuras)
            const { data: dataProximas, error: errProx } = await supabase
                .from('exposiciones')
                .select('tema, fecha_programada')
                .in('id_equipo', idsEquipos)
                .gte('fecha_programada', new Date().toISOString())
                .order('fecha_programada', { ascending: true })
                .limit(3);
            
            if (errProx) throw errProx;
            proximas = dataProximas;
        }

        // 4. Evaluaciones realizadas por este alumno (como evaluador)
        const { count: totalEvaluaciones, error: errEval } = await supabase
            .from('evaluaciones')
            .select('*', { count: 'exact', head: true })
            .eq('id_alumno_evaluador', id_alumno);

        if (errEval) throw errEval;

        // Respuesta final estructurada para el Frontend
        res.status(200).json({
            materias_activas: totalMaterias || 0,
            grupos_totales: totalMaterias || 0, // Usamos materias como referencia a grupos
            exposiciones: totalExpos || 0,
            evaluadas: totalEvaluaciones || 0,
            proximas_exposiciones: proximas || []
        });

    } catch (err) {
        console.error("Error en getStudentStats:", err.message);
        next(err);
    }
}

module.exports = {
    getAlumnos,
    getAlumnoById,
    createAlumno,
    updateAlumno,
    deleteAlumno,
    getStudentStats // Exportada correctamente
}