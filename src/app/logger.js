const { createLogger, transports, format } = require('winston')

const customFormat = format.combine(format.timestamp(), format.printf((info) => {
  return `${info.timestamp} - [${info.level.toUpperCase().padStart(5).padEnd(6)}] - ${info.message}`
}))

const logger = createLogger({
  format: customFormat,

  transports: [
    new transports.Console({ level: 'silly' }),
    new transports.File({ filename: 'lerner.log', level: 'info' })
  ]
})

module.exports = logger
