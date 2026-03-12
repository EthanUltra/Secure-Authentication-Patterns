const authService = require('./auth.service')
const { z } = require('zod')
const env = require('../../config/env')

const COOKIE_OPTS = {
  httpOnly: true, secure: env.isProd, sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh',
}

const registerSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(2).max(80),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
})
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body)
    const user = await authService.register(body)
    res.status(201).json({ status: 'success', data: { user } })
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body)
    const { accessToken, refreshToken } = await authService.login(body)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ status: 'success', data: { accessToken } })
  } catch (err) { next(err) }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ status: 'error', message: 'No refresh token' })
    const { accessToken, refreshToken } = await authService.refresh(token)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.json({ status: 'success', data: { accessToken } })
  } catch (err) { next(err) }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies?.refreshToken)
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' })
    res.json({ status: 'success', message: 'Logged out' })
  } catch (err) { next(err) }
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.userId)
    res.json({ status: 'success', data: { user } })
  } catch (err) { next(err) }
}

module.exports = { register, login, refresh, logout, me }
