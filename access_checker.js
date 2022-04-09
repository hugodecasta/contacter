module.exports = async (method, token, key_db_host) => {
    const url = key_db_host + '/api/auth/roles'
    const options = {
        method: 'GET',
        headers: {
            Authorization: token
        }
    }
    const resp = await require('node-fetch')(url, options)
    if (!resp.ok) throw new Error('Auth error: ' + await resp.text())
    const roles = await resp.json()
    const method_role_name = 'contact_' + method
    const has_contact_access = roles.includes('admin') || roles.includes(method_role_name)
    return has_contact_access
}