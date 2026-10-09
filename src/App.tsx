import { useEffect, useRef } from 'react'
import { ChatComposer } from './components/ChatComposer'
import { MessageList } from './components/MessageList'
import { NoConversationState } from './components/NoConversationState'
import { generateBotResponse } from './services/generateBotResponse'
import type { ChatMessage, ChatRole } from './types/chat'
import { useChatStore } from './stores/useChatStore'

const BOT_RESPONSE_DELAY = 700

function createMessage(content: string, role: ChatRole): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
}

export default function App() {
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const activeConversation = useChatStore((state) =>
    state.activeConversationId ? state.conversations[state.activeConversationId] : undefined,
  )
  const addMessage = useChatStore((state) => state.addMessage)
  const startBotResponse = useChatStore((state) => state.startBotResponse)
  const finishBotResponse = useChatStore((state) => state.finishBotResponse)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const responseTimersRef = useRef<number[]>([])

  const messages = activeConversation?.messages ?? []
  const isBotThinking = (activeConversation?.pendingResponses ?? 0) > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isBotThinking])

  useEffect(() => {
    return () => {
      responseTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  function handleSend(content: string, role: ChatRole) {
    if (!activeConversationId) return

    const conversationId = activeConversationId
    addMessage(conversationId, createMessage(content, role))

    if (role !== 'user') {
      return
    }

    startBotResponse(conversationId)

    const responseTimer = window.setTimeout(() => {
      finishBotResponse(conversationId, createMessage(generateBotResponse(content), 'bot'))
      responseTimersRef.current = responseTimersRef.current.filter((timer) => timer !== responseTimer)
    }, BOT_RESPONSE_DELAY)
    responseTimersRef.current.push(responseTimer)
  }

  return (
    <main className="min-h-dvh bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <section aria-labelledby="chat-title" className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-2xl flex-col sm:min-h-[calc(100dvh-3rem)]">
        <header className="px-2 pb-4 sm:px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Chat offline</p>
          <h1 id="chat-title" className="mt-1 text-xl font-semibold text-slate-900">Conversa local</h1>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-slate-200/70 ring-1 ring-slate-200">
          <div className="min-h-0 flex-1 overflow-y-auto" role="log" aria-label="Historico da conversa" aria-live="polite">
            {activeConversation ? (
              <MessageList messages={messages} isBotThinking={isBotThinking} />
            ) : (
              <NoConversationState />
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="shrink-0 p-3 sm:p-4">
            <ChatComposer onSend={handleSend} disabled={!activeConversation} />
          </div>
        </div>
      </section>
    </main>
  )
}