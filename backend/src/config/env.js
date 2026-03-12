require('dotenv').config()

module.exports = {
  port: process.env.PORT || 4000,
  isProd: process.env.NODE_ENV === 'production',
  jwt: {
    accessSecret:     process.env.JWT_ACCESS_SECRET  || 'dev-access-secret',
    refreshSecret:    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn:  process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}
