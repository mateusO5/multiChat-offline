import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatStore } from './useChatStore'
import type { ChatMessage } from '../types/chat'

function message(id: string, content: string): ChatMessage {
  return { id, role: 'user', content, createdAt: Number(id) || 1 }
}

describe('useChatStore', () => {
  beforeEach(() => {
    let nextId = 1
    vi.stubGlobal('crypto', { randomUUID: () => `conversation-${nextId++}` })
    useChatStore.setState({ conversations: {}, activeConversationId: null, nextContactGender: 'woman' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a conversation and activates it immediately', () => {
    const id = useChatStore.getState().createConversation()
    const state = useChatStore.getState()

    expect(state.activeConversationId).toBe(id)
    expect(state.conversations[id]).toMatchObject({ id, messages: [], pendingResponses: 0 })
  })

  it('generates fictional phone contacts and alternates their gender', () => {
    const { createConversation } = useChatStore.getState()
    const firstId = createConversation()
    const secondId = createConversation()
    const first = useChatStore.getState().conversations[firstId]
    const second = useChatStore.getState().conversations[secondId]

    expect(first.contactNumber).toMatch(/^\(\d{2}\) 9\d{4}-\d{4}$/)
    expect(first.contactName).toBeTruthy()
    expect(first.contactGender).toBe('woman')
    expect(second.contactGender).toBe('man')
  })

  it('keeps histories separate when switching conversations', () => {
    const { createConversation, addMessage, selectConversation } = useChatStore.getState()
    const firstId = createConversation()
    addMessage(firstId, message('1', 'Mensagem da primeira conversa'))
    const secondId = createConversation()
    addMessage(secondId, message('2', 'Mensagem da segunda conversa'))

    selectConversation(firstId)

    const state = useChatStore.getState()
    expect(state.conversations[firstId].messages.map(({ content }) => content)).toEqual([
      'Mensagem da primeira conversa',
    ])
    expect(state.conversations[secondId].messages.map(({ content }) => content)).toEqual([
      'Mensagem da segunda conversa',
    ])
    expect(state.activeConversationId).toBe(firstId)
  })

  it('trims names and rejects empty conversation names', () => {
    const id = useChatStore.getState().createConversation()
    const { renameConversation } = useChatStore.getState()

    expect(renameConversation(id, '   ')).toBe(false)
    expect(useChatStore.getState().conversations[id].name).toBeUndefined()
    expect(renameConversation(id, '  Projeto  ')).toBe(true)
    expect(useChatStore.getState().conversations[id].name).toBe('Projeto')
    expect(useChatStore.getState().conversations[id].id).toBe(id)
  })

  it('selects the most recently updated remaining conversation after deletion', () => {
    const { createConversation, selectConversation, deleteConversation } = useChatStore.getState()
    const olderId = createConversation()
    const newerId = createConversation()

    useChatStore.setState((state) => ({
      conversations: {
        ...state.conversations,
        [olderId]: { ...state.conversations[olderId], updatedAt: 10 },
        [newerId]: { ...state.conversations[newerId], updatedAt: 20 },
      },
    }))
    selectConversation(olderId)
    deleteConversation(olderId)

    expect(useChatStore.getState().activeConversationId).toBe(newerId)

    deleteConversation(newerId)
    expect(useChatStore.getState().activeConversationId).toBeNull()
  })

  it('routes a delayed bot response to its source conversation and ignores deleted chats', () => {
    const { createConversation, startBotResponse, finishBotResponse, deleteConversation } = useChatStore.getState()
    const sourceId = createConversation()
    startBotResponse(sourceId)
    const otherId = createConversation()

    finishBotResponse(sourceId, { id: 'bot-1', role: 'bot', content: 'Resposta', createdAt: 3 })

    expect(useChatStore.getState().activeConversationId).toBe(otherId)
    expect(useChatStore.getState().conversations[sourceId].messages[0].content).toBe('Resposta')
    expect(useChatStore.getState().conversations[sourceId].pendingResponses).toBe(0)

    deleteConversation(sourceId)
    finishBotResponse(sourceId, { id: 'bot-2', role: 'bot', content: 'Tardia', createdAt: 4 })
    expect(useChatStore.getState().conversations[sourceId]).toBeUndefined()
  })
})
