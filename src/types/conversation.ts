import type { ChatMessage } from './chat'

export type ChatConversation = {
  id: string
  name?: string
  messages: ChatMessage[]
  updatedAt: number
  pendingResponses: number
}
