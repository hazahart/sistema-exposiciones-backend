const errorHandler = (err, req, res, next) => {
    console.error(err)

    const status = err.status || 500
    const error  = err.error  || 'Internal Server Error'
    const message = err.message || 'Error inesperado en el servidor'

    res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error,
        message,
        path: req.path
    })
}

module.exports = errorHandler