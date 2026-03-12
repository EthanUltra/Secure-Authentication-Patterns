const jwt  = require('jsonwebtoken')
const env  = require('../config/env')

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn })
}

function signRefreshToken(payload) {
  const token = jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn })
  return { token }
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

function expiresAt(duration) {
  const ms = { '7d': 7*24*3600*1000, '1d': 24*3600*1000, '15m': 15*60*1000 }
  return new Date(Date.now() + (ms[duration] || 7*24*3600*1000))
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, expiresAt }
