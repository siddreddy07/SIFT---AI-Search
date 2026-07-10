import { verifyAccessToken } from "../services/jwt.service.js"

export const authenticate = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken
    const refreshToken = req.cookies?.refreshToken

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ success: false, message: 'Session expired. Login again.',code:'NO_TOKEN' })
    }

    const decoded = verifyAccessToken(accessToken)
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token.',code:'TOKEN_EXPIRED' })
  }
}
