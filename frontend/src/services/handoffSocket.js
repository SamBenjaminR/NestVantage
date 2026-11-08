
import { Client } from '@stomp/stompjs'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const WS_URL = API_BASE_URL
  .replace(/^http/, 'ws')
  .replace(/\/api\/?$/, '/ws')

export const connectHandoffSocket = (onNotification) => {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log('NestVantage WebSocket connected')

      client.subscribe('/topic/handoffs', (message) => {
        const notification = JSON.parse(message.body)

        onNotification({
          ...notification,
          type: 'HANDOFF'
        })
      })

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
