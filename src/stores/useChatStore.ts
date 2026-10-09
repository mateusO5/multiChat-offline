import { create } from 'zustand'
import type { ChatStore } from '../types/chatStore'

export const useChatStore = create<ChatStore>((set) => ({
  conversations: {},
  activeConversationId: null,

  createConversation: () => {
    const id = crypto.randomUUID()
    const now = Date.now()

    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: {
          id,
          messages: [],
          updatedAt: now,
          pendingResponses: 0,
        },
      },
      activeConversationId: id,
    }))

    return id
  },

  selectConversation: (conversationId) => {
    set((state) => {
      if (conversationId !== null && !state.conversations[conversationId]) {
        return state
      }

      return { activeConversationId: conversationId }
    })
  },

  renameConversation: (conversationId, name) => {
    const normalizedName = name.trim()
    if (!normalizedName) return false

    let renamed = false
    set((state) => {
      const conversation = state.conversations[conversationId]
      if (!conversation) return state

      renamed = true
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            name: normalizedName,
            updatedAt: Date.now(),
          },
        },
      }
    })

    return renamed
  },

  deleteConversation: (conversationId) => {
    set((state) => {
      if (!state.conversations[conversationId]) return state

      const conversations = { ...state.conversations }
      delete conversations[conversationId]

      const activeConversationId =
        state.activeConversationId === conversationId
          ? Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null
          : state.activeConversationId

      return { conversations, activeConversationId }
    })
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const conversation = state.conversations[conversationId]
      if (!conversation) return state

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: [...conversation.messages, message],
            updatedAt: Date.now(),
          },
        },
      }
    })
  },

  startBotResponse: (conversationId) => {
    set((state) => {
      const conversation = state.conversations[conversationId]
      if (!conversation) return state

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            pendingResponses: conversation.pendingResponses + 1,
          },
        },
      }
    })
  },

  finishBotResponse: (conversationId, message) => {
    set((state) => {
      const conversation = state.conversations[conversationId]
      if (!conversation) return state

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: [...conversation.messages, message],
            updatedAt: Date.now(),
            pendingResponses: Math.max(0, conversation.pendingResponses - 1),
          },
        },
      }
    })
  },
}))
