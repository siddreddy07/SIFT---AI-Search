import { redisKeys } from "../config/redis.js"
import { userService } from "./user.service.js"

export const updateUserController = async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const updatedUser = await userService.updateUser(userId, req.body)

    return res.status(200).json({ success: true, user: updatedUser })
  } catch (error) {
    console.log('Error :', error)
    return res.status(500).json({ success: false, message: 'Unable to update user data' })
  }
}