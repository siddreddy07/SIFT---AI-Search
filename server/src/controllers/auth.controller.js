import {loginService, logoutService, refreshTokenService, signupService } from "../services/auth.service.js"
import { userService } from "../services/user.service.js"

export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Password are required' })
    }

    const { accessToken, refreshToken, user } = await signupService({ name, email, password })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json({ success: true, user })
  } catch (error) {
    return res.status(409).json({ success: false, message: error.message })
  }
}

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    if(!email || !password){
      return res.status(400).json({success:false,message:'Email/Password are mandatory'})
    }

    const { accessToken, refreshToken, user } = await loginService({ email, password })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message })
  }
}

export const meController = async (req, res) => {
  try {
    const user = await userService.getUser(req.user.userId)
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message })
  }
}

export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    console.log('Refresh TOken :',refreshToken)
    const tokens = await refreshTokenService(refreshToken)

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message })
  }
}


export const logoutController = async (req, res) => {
  try {
    const { userId } = req.user

    console.log(req)

    await logoutService({ userId })

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}