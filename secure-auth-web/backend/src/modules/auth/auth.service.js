const argon2  = require('argon2')
const prisma  = require('../../config/prisma')
const { signAccessToken, signRefreshToken, verifyRefreshToken, expiresAt } = require('../../utils/tokens')
const { AuthError, ConflictError } = require('../../utils/errors')
const env = require('../../config/env')

const MAX_FAILS = 5
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummysaltdummysalt$dummyhash'

async function register({ email, password, name }) {
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new ConflictError('An account with that email already exists')
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })
  return prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await argon2.verify(DUMMY_HASH, password).catch(() => {})
    throw new AuthError('Invalid email or password')
  }
  if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AuthError('Account locked due to too many failed attempts. Try again later.')
  }
  const valid = await argon2.verify(user.passwordHash, password)
  if (!valid) {
    const failedLogins = user.failedLogins + 1
    const shouldLock   = failedLogins >= MAX_FAILS
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins,
        isLocked:    shouldLock,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
      },
    })
    throw new AuthError('Invalid email or password')
  }
  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, isLocked: false, lockedUntil: null } })
  return issueTokens(user)
}

async function refresh(incomingToken) {
  let decoded
  try { decoded = verifyRefreshToken(incomingToken) } catch { throw new AuthError('Invalid or expired refresh token') }
  const stored = await prisma.refreshToken.findUnique({ where: { token: incomingToken }, include: { user: true } })
  if (!stored) throw new AuthError('Refresh token not found')
  if (stored.isRevoked) {
    await prisma.refreshToken.updateMany({ where: { userId: stored.userId }, data: { isRevoked: true } })
    throw new AuthError('Refresh token reuse detected. All sessions revoked.')
  }
  if (stored.expiresAt < new Date()) throw new AuthError('Refresh token expired')
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } })
  return issueTokens(stored.user)
}

async function logout(refreshToken) {
  if (!refreshToken) return
  await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } })
}

async function me(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, failedLogins: true, isLocked: true },
  })
}

async function issueTokens(user) {
  const accessToken    = signAccessToken({ userId: user.id, role: user.role, email: user.email, name: user.name })
  const { token: refreshToken } = signRefreshToken({ userId: user.id })
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: expiresAt(env.jwt.refreshExpiresIn) } })
  return { accessToken, refreshToken }
}

module.exports = { register, login, refresh, logout, me }
