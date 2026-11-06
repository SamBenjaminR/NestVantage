
import { Client } from '@stomp/stompjs'

const WS_URL = 'ws://localhost:8080/ws'

export const connectHandoffSocket = (onNotification) => {
  const client = new Client({
    brokerURL: WS_URL,

    reconnectDelay: 5000,

    onConnect: () => {
      console.log('NestVantage WebSocket connected')

      client.subscribe('/topic/handoffs', (message) => {
        const notification = JSON.parse(message.body)
        onNotification(notification)
      })
    },

    onStompError: (frame) => {
      console.error('WebSocket error:', frame.headers.message)
    },

    onWebSocketError: (error) => {
      console.error('WebSocket connection error:', error)
    }
  })

  client.activate()

  return () => {
    client.deactivate()
  }
}
