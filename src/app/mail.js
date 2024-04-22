const nodemailer = require('nodemailer')
const LOG = require('./logger')

const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: process.env.PORT_EMAIL,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL
  }
})

transporter.verify().then(() => {
  LOG.info('Ready for send emails')
})

module.exports = transporter
