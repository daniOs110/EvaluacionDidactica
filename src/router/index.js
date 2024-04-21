const app = require('../app/app')
const LOG = require('../app/logger')

const port = process.env.PORT || 3001

app.listen(port, () => {
  LOG.info(`Server running on port ${port}`)
})
