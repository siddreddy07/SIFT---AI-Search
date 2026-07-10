class SSEManager {
    constructor() {
        this.clients = new Map()
    }

    addClient(userId,res) {
        this.clients.set(userId,res)
    }

    removeClient(userId) {
        this.clients.delete(userId)
    }

    sendToUser(userId,payload) {
        const client = this.clients.get(userId)

        if(!client) return

        client.write(`data: ${JSON.stringify(payload)}\n\n`)

    }

}

export default new SSEManager()