module.exports = async (PORT) => {

    const express = require('express')
    const app = express()

    const http = require('http')

    const api = require('./api')
    app.use('/api', api)

    const swaggerUi = require('swagger-ui-express')
    const swaggerFile = require('./swagger_output.json')
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

    const server = http.createServer(app).listen(PORT)
    server.on('close', () => console.log('Contacter Server closed'))

    console.log('Contacter Server listening on', PORT)

    return server
}