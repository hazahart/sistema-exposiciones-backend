const express = require('express')
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler')

const authRoutes = require('./routes/auth.routes')
const materiasRoutes = require('./routes/materias.routes')
const alumnosRoutes = require('./routes/alumnos.routes')
const gruposRoutes = require('./routes/grupos.routes')
// const equiposRoutes = require('./routes/equipos.routes')
// const exposicionesRoutes = require('./routes/exposiciones.routes')
// const criteriosRoutes = require('./routes/criterios.routes')
// const evaluacionesRoutes = require('./routes/evaluaciones.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1/auth',         authRoutes)
app.use('/api/v1/materias',     materiasRoutes)
app.use('/api/v1/alumnos',      alumnosRoutes)
app.use('/api/v1/grupos',       gruposRoutes)
// app.use('/api/v1/equipos',      equiposRoutes)
// app.use('/api/v1/exposiciones', exposicionesRoutes)
// app.use('/api/v1/criterios',    criteriosRoutes)
// app.use('/api/v1/evaluaciones', evaluacionesRoutes)

app.use(errorHandler)

module.exports = app