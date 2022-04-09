const nodemailer = require('nodemailer')

const transport = {
    service: process.env.MAIL_SERVICE,
    port: parseInt(process.env.MAIL_PORT),
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
}

module.exports = async (contact, data) => {

    const transporter = nodemailer.createTransport(transport)

    const mailOptions = {
        from: data.from ?? process.env.MAIL_USER,
        to: contact,
        subject: data.subject,
        html: data.html
    }

    return new Promise((ok, rej) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) rej(error)
            else ok(info)
        })
    })
}