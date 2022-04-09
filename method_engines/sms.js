const twilio_client_maker = require('twilio')

module.exports = async (contact, data) => {

    const SID = process.env.SMS_SID
    const AuthToken = process.env.SMS_AUTHTOKEN
    const from_number = process.env.SMS_NUMBER

    const client = twilio_client_maker(SID, AuthToken)

    return client.messages
        .create({
            body: data.text,
            from: data.from ?? from_number,
            to: contact
        })
}