import type { ChatMessage } from './chat'
import type { ChatConversation } from './conversation'

export type ChatStore = {
  conversations: Record<string, ChatConversation>
  activeConversationId: string | null
  createConversation: () => string
  selectConversation: (conversationId: string | null) => void
  renameConversation: (conversationId: string, name: string) => boolean
  deleteConversation: (conversationId: string) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  startBotResponse: (conversationId: string) => void
  finishBotResponse: (conversationId: string, message: ChatMessage) => void
}