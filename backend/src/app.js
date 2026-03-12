const express      = require('express')
const helmet       = require('helmet')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errorHandler')
const authRoutes   = require('./modules/auth/auth.routes')

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)

app.use(errorHandler)

module.exports = app
