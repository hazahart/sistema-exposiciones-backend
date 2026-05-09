const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Token ausente o formato inválido',
            path: req.path
        })
    }

    const token = header.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.alumno = payload
        next()
    } catch (err) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Token JWT inválido o expirado',
            path: req.path
        })
    }
}

module.exports = auth