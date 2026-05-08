const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')

const login = async (req, res, next) => {
    try {
        const { matricula, password } = req.body

        if (!matricula || !password) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Los campos matricula y password son requeridos',
                path: req.path
            })
        }

        const { data: alumno, error } = await supabase
            .from('alumnos')
            .select('id_alumno, matricula, nombre, correo, password')
            .eq('matricula', matricula)
            .single()

        if (error || !alumno) {
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                status: 401,
                error: 'Unauthorized',
                message: 'Matrícula o contraseña incorrectos',
                path: req.path
            })
        }

        const passwordValido = await bcrypt.compare(password, alumno.password)

        if (!passwordValido) {
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                status: 401,
                error: 'Unauthorized',
                message: 'Matrícula o contraseña incorrectos',
                path: req.path
            })
        }

        const token = jwt.sign(
            {
                id_alumno: alumno.id_alumno,
                matricula: alumno.matricula,
                nombre: alumno.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        )

        res.status(200).json({ token })

    } catch (err) {
        next(err)
    }
}

module.exports = { login }