require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/api/v1`)
})