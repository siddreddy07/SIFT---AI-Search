import * as googleService from '../services/google.service.js'

export const googleAuth = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const url = await googleService.initiateAuth(userId)
    res.json({ success: true, url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query
    if (!code || !state) {
      return res.status(400).json({ error: 'code and state are required' })
    }

    await googleService.handleCallback(code, state)
    res.redirect(
      `${process.env.FRONTEND_URL}/integrations?provider=google&success=true`
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getIntegration = async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const integration = await googleService.getIntegration(userId)
    if (!integration) {
      return res.status(404).json({ error: 'No active integration found' })
    }

    res.json({
      success: true,
      data: {
        id: integration._id.toString(),
        email: integration.email,
        provider: integration.provider,
        userId: integration.userId,
        status: integration.status,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllIntegrations = async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const integrations = await googleService.getAllIntegrations(userId)

    console.log("Integrations :",integrations)

    res.json({ success: true, data: integrations })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const revokeIntegration = async (req, res) => {
  try {
    const { integrationId } = req.params
    if (!integrationId) {
      return res.status(400).json({ error: 'integrationId is required' })
    }

    await googleService.revokeIntegration(integrationId)
    res.json({ success: true, message: 'Integration revoked' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
