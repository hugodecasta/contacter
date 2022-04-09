module.exports = (contact, data) => {
    data.is_done = true
    const send = {
        from: data.from,
        to: contact,
        data: data
    }
    if (!data.is_valid) throw new Error('invalid data')
    return send
}