import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret'

export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET)
}

export function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}
