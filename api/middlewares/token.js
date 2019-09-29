const jwt = require('jsonwebtoken')
const Debug = require('debug')
const settings = require('../config/settings')
const debug = new Debug('api/middleware/token')

const required = (req, res, next) => {
  const tok = req.headers.authorization || null
  debug(`TOKENNN `, tok)

  if (!tok) {
    debug('JWT was not enctrypted with our secret')
    return res.status(401).json({
      message: 'Unauthorized 1'
    })
  }

  debug(tok.split(' ')[0])
  if (req.headers && req.headers.authorization && tok.split(' ')[0] === 'Bearer') {
    jwt.verify(tok.split(' ')[1], settings.token.secret, (err, token) => {
      if (err) {
        debug('JWT was not enctrypted with our secret')
        return res.status(401).json({
          message: 'Unauthorized 2',
          error: err
        })
      }
      debug(`token verificado con exito ${JSON.stringify(token)}`)
      req.token = token
      next()
    })
  }
}
module.exports = required
