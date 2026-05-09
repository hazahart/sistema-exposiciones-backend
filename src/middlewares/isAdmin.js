const isAdmin = (req, res, next) => {
    if (req.alumno?.rol !== 'admin') {
        return res.status(403).json({
            timestamp: new Date().toISOString(),
            status: 403,
            error: 'Forbidden',
            message: 'No tienes permisos para realizar esta acción',
            path: req.path
        })
    }
    next()
}

module.exports = isAdmin