const router      = require('express').Router()
const ctrl        = require('./auth.controller')
const authenticate = require('../../middleware/authenticate')
const rateLimit   = require('express-rate-limit')

const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { status:'error', message:'Too many attempts' } })
const regLimiter   = rateLimit({ windowMs: 60*60*1000, max: 5,  message: { status:'error', message:'Too many accounts' } })

router.post('/register', regLimiter,  ctrl.register)
router.post('/login',    loginLimiter, ctrl.login)
router.post('/refresh',  ctrl.refresh)
router.post('/logout',   ctrl.logout)
router.get('/me',        authenticate, ctrl.me)

module.exports = router
