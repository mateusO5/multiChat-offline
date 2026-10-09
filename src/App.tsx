import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatSidebar } from './components/ChatSidebar'
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const conversationsById = useChatStore((state) => state.conversations)
  const conversations = useMemo(
    () => Object.values(conversationsById).sort((a, b) => b.updatedAt - a.updatedAt),
    [conversationsById],
  )
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const activeConversation = useChatStore((state) =>
    state.activeConversationId ? state.conversations[state.activeConversationId] : undefined,
  )
  const addMessage = useChatStore((state) => state.addMessage)
  const startBotResponse = useChatStore((state) => state.startBotResponse)
  const finishBotResponse = useChatStore((state) => state.finishBotResponse)
  const createConversation = useChatStore((state) => state.createConversation)
  const selectConversation = useChatStore((state) => state.selectConversation)
  const renameConversation = useChatStore((state) => state.renameConversation)
  const deleteConversation = useChatStore((state) => state.deleteConversation)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const responseTimersRef = useRef<number[]>([])

  const messages = useMemo(() => activeConversation?.messages ?? [], [activeConversation?.messages])
  const isBotThinking = (activeConversation?.pendingResponses ?? 0) > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isBotThinking])

  useEffect(() => {
    return () => {
      responseTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
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
    <main className="flex min-h-dvh bg-slate-100">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isMobileOpen={isMobileSidebarOpen}
        onCreateConversation={createConversation}
        onSelectConversation={selectConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Abrir conversas"
            aria-expanded={isMobileSidebarOpen}
            aria-controls="mobile-conversation-sidebar"
            className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-violet-600 md:hidden"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Chat offline</p>
            <h1 id="chat-title" className="mt-1 text-xl font-semibold text-slate-900">Conversa local</h1>
          </div>
        </header>
        <section aria-labelledby="chat-title" className="flex min-h-0 flex-1 flex-col p-3 pt-0 sm:p-6 sm:pt-2">
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
      </div>
    </main>
  )
}