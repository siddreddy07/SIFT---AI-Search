import { ObjectId } from "mongodb"
import { getDb } from "../config/db.js"
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt.service.js"

export const signupService = async ({ name, email, password }) => {
  const existing = await getDb().collection('user').findOne({ email })

  if (existing) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await hashPassword(password)

  const { insertedId } = await getDb().collection('user').insertOne({
    name,
    email,
    password: hashedPassword,
    role: 'user',
    apikeys: [
    {
      type: "default",
      provider: "",
      key: ""
    },
    {
      type: "image",
      provider: "",
      key: ""
    }
  ],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const user = { _id: insertedId, name, email, updatedAt: new Date() }

  const accessToken = signAccessToken({ userId: insertedId, email, role: 'user' })
  const refreshToken = signRefreshToken({ userId: insertedId, role: 'user' })

  await getDb().collection('user').updateOne(
    { _id: insertedId },
    { $set: { refreshToken } }
  )

  return { accessToken, refreshToken, user }
}

export const loginService = async ({ email, password }) => {

  const user = await getDb().collection('user').findOne({ email })

  if (!user) {
    throw new Error('Invalid email/password')
  }

  const isMatch = await comparePassword(password, user.password)

  if (!isMatch) {
    throw new Error('Invalid email/password')
  }

  const accessToken = signAccessToken({ userId: user._id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user._id, role: user.role })

  await getDb().collection('user').updateOne(
    { _id: user._id },
    { $set: { refreshToken } }
  )

  return { accessToken, refreshToken, user:{_id:user._id,email:user.email,name:user.name,updatedAt:user.updatedAt} }
}

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is missing')
  }

  const decoded = verifyRefreshToken(refreshToken)
  console.log('Decoded :',decoded)
  const user = await getDb().collection('user').findOne({ _id: new ObjectId(decoded.userId) })

  if (!user) {
    throw new Error('User not found')
  }

  const accessToken = signAccessToken({ userId: user._id, email: user.email, role: user.role })
  const newRefreshToken = signRefreshToken({ userId: user._id, role: user.role })

  await getDb().collection('user').updateOne(
    { _id: user._id },
    { $set: { refreshToken: newRefreshToken } }
  )

  return { accessToken, refreshToken: newRefreshToken }
}


export const logoutService = async ({ userId }) => {
  await getDb().collection('user').updateOne(
    { _id: new ObjectId(userId) },
    { $unset: { refreshToken: "" } }
  )
}
