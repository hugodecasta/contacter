const fs = require('fs')

const contact_engine = {}
module.exports = contact_engine

const methods_dir = __dirname + '/method_engines'

// ----------------------------------------------------- MODULE

contact_engine.methods = () => {
    return fs.readdirSync(methods_dir).map(file => file.replace('.js', ''))
}

contact_engine.send = (method, contact, data) => {
    if (!data) throw new Error('Contact data object must not be null')
    if (!contact_engine.methods().includes(method)) throw new Error(`Contact method "${method}" not found`)
    const method_engine = require(methods_dir + '/' + method)
    return method_engine(contact, data)
}