
import { Client } from '@stomp/stompjs'

const WS_URL = 'ws://localhost:8080/ws'

export const connectHandoffSocket = (onNotification) => {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log('NestVantage WebSocket connected')

      // Human handoff notifications
      client.subscribe('/topic/handoffs', (message) => {
        const notification = JSON.parse(message.body)

        onNotification({
          ...notification,
          type: 'HANDOFF'
        })
      })

      // Site-visit reminder notifications
      client.subscribe('/topic/site-visits', (message) => {
        const notification = JSON.parse(message.body)

        onNotification({
          ...notification,
          type: 'SITE_VISIT_REMINDER'
        })
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
