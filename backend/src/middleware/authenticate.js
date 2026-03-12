const { verifyAccessToken } = require('../utils/tokens')
const { AuthError }         = require('../utils/errors')

module.exports = function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) throw new AuthError('No token provided')
    const token = auth.slice(7)
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next(new AuthError('Invalid or expired access token'))
  }
}
