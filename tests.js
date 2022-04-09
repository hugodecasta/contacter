require("dotenv").config()

const test = require('ava')
const server = require('./server')
const fetch = require('node-fetch')

const contact_engine = require('./contact_engine')
const access_checker = require('./access_checker')

const key_db_host = process.env.KEYDB_HOST

const test_auth = {
    conn: process.env.TEST_CONN,
    pass: process.env.TEST_PASS
}

let listening_server = null

// ---------------------------------------- ENGINE TESTS

// ------------------------- ACCESS CHECKER

test.serial('check methods', t => {
    let methods = null
    t.notThrows(() => methods = contact_engine.methods())
    t.true(methods.includes('sms'))
    t.true(methods.length == 3)
})

test.serial('contact method not exists', t => {
    t.throws(() => contact_engine.send('nomethod', null, null))
})

test.serial('contact fail', t => {
    t.throws(() => contact_engine.send('test', 'contact', { is_valid: false }))
})

test.serial('contact success', t => {
    let rec = null
    t.notThrows(() => rec = contact_engine.send('test', 'contact', { is_valid: true }))
    t.true(rec.data.is_done)
})

// ---------------------------------------- API TESTS

// ------------------------- OPEN SERVER

async function send_global(url, method = 'GET', data = null, token = null) {
    url = url
    const options = {
        method,
        headers: {
            'content-type': data ? 'application/json' : '',
        },
        body: data ? JSON.stringify(data) : undefined
    }
    if (token) options.headers.Authorization = token
    const resp = await fetch(url, options)
    if (!resp.ok) {
        const err = new Error(await resp.text())
        err.status = resp.status
        throw err
    }
    const json = await resp.json()
    return json
}

function send_host(url, method, data, token) {
    return send_global(key_db_host + '/' + url, method, data, token)
}
function send(url, method, data, token) {
    return send_global('http://localhost:3000' + url, method, data, token)
}

function connect_contact_tester() {
    return send_host('/api/auth/connect', 'post', test_auth, null)
}

test.serial.before(async () => {
    listening_server = await server(3000)
})
// ------------------------- TESTS

let test_token = null

test.serial('connect tester', async t => {
    await t.notThrowsAsync(async () => test_token = await connect_contact_tester())
    t.true(test_token != null)
})

test.serial('get methods', async t => {
    let methods = null
    await t.notThrowsAsync(async () => methods = await send('/api/methods'))
    t.true(methods.includes('sms'))
    t.true(methods.length == 3)
})

test.serial('check access', async t => {
    let has_access = null
    await t.throwsAsync(async () => has_access = await send('/api/has_access/test'))
    await t.notThrowsAsync(async () => has_access = await send('/api/has_access/test', 'get', null, test_token))
    t.true(has_access)
    await t.notThrowsAsync(async () => has_access = await send('/api/has_access/mail', 'get', null, test_token))
    t.false(has_access)
})

test.serial('no connect not allowed', async t => {
    await t.throwsAsync(() => send('/api/send/test', 'post', { is_valid: true }))
})

test.serial('connected is allowed', async t => {
    await t.notThrowsAsync(() => send('/api/send/test', 'post', { contact: 'jack', data: { is_valid: true, hello: 'world' } }, test_token))
})

// ------------------------- CLOSE SERVER

test.serial.after.always(() => {
    listening_server.close()
})

// ---------------------------------------- END