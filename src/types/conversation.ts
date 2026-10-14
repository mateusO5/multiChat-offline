import type { ChatMessage } from './chat'

export type ContactGender = 'woman' | 'man'

export type ChatConversation = {
  id: string
  contactNumber: string
  contactName: string
  contactGender: ContactGender
  name?: string
  messages: ChatMessage[]
  updatedAt: number
  pendingResponses: number
}
