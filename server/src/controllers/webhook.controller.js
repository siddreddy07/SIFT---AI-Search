import * as googleService from "../services/google.service.js" 

export const handleGmailPush = async (req, res) => {
  try {
    console.log('Gmail Pub/Sub push received:', JSON.stringify(req.body, null, 2))
    const message = req.body?.message?.data
    if (message) {
      const decoded = Buffer.from(message, 'base64').toString('utf-8')
      const data = JSON.parse(decoded)
      await googleService.syncHistory(data)
      console.log('Gmail Pub/Sub decoded data:', data)
    }
    res.sendStatus(200)
  } catch (error) {
    console.error('Gmail Pub/Sub error:', error)
    res.sendStatus(500)
  }
}

export const handleCalendarNotification = async (req, res) => {
  try {
    console.log('Calendar webhook headers:', JSON.stringify(req.headers, null, 2))
    res.sendStatus(200)
  } catch (error) {
    console.error('Calendar webhook error:', error)
    res.sendStatus(500)
  }
}
