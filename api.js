const api = require('express').Router()
const json_parser = require('body-parser').json()
const cors = require('cors')

module.exports = api

api.use(cors())

const access_checker = require('./access_checker')
const contact_engine = require('./contact_engine')

// ----------------------------------- AUTH

function parse_method(req, res, next) {
    const method = req.params.method
    req.method = method
    next()
}

function parse_contact_data(req, res, next) {
    const body = req.body
    const { contact, data } = body
    req.contact = contact
    req.data = data
    next()
}

function parse_token(req, res, next) {
    const token = req.get('Authorization')
    req.token = token
    next()
}

function token_has_access(token, method) {
    return access_checker(method, token, process.env.KEYDB_HOST)
}

function check_auth(req, res, next) {
    parse_token(req, res, async () => {
        const token = req.token
        if (!token) return res.status(401).send('unauthorized')
        const has_access = await token_has_access(token, req.method)
        if (!has_access) return res.status(401).send('unauthorized user')
        return next()
    })
}

function json_reser(method) {
    return async function (req, res, next) {
        try {
            res.json(await method(req))
        } catch (e) {
            res.status(500).send(e + '')
        }
    }
}
// ----------------------------------- ENTRY
api.get('/', (req, res) => res.json('Hey ! Welcome on Contacter Server !'))

// ----------------------------------- ADMIN


api.post('/send/:method',
    parse_method, check_auth, json_parser, parse_contact_data,
    json_reser((req) =>
        /*
            #swagger.security = [{"Auth_user": []}]

            #swagger.requestBody = {
                required: true,
                content: {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "contact": { type: "string", example: "jack@gmail.com" },
                                "data": { type: "object", example: {subject:"Subject",html:"<h1>Hello Jack !</h1>"} },
                            },
                        }
                    }
                }
            }
        */
        contact_engine.send(req.method, req.contact, req.data)))

api.get('/has_access/:method', parse_method, parse_token, json_reser((req) => token_has_access(req.token, req.method)))

api.get('/methods', json_reser((req) => contact_engine.methods()))