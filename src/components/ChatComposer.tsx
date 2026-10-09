import { useEffect, useRef, useState } from 'react'
import type { ChatRole } from '../types/chat'

type ChatComposerProps = {
  onSend: (content: string, role: ChatRole) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
  const [content, setContent] = useState('')
  const [role, setRole] = useState<ChatRole>('user')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isBotMode = role === 'bot'
  const hasContent = content.trim().length > 0

  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }, [content])

  function toggleRole() {
    setRole((currentRole) => (currentRole === 'user' ? 'bot' : 'user'))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (disabled || !hasContent) {
      return
    }

    onSend(content.trim(), role)
    setContent('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Enviar mensagem"
      className={`rounded-2xl bg-white p-3 shadow-lg shadow-slate-200/60 ring-1 transition-colors ${isBotMode ? 'ring-violet-400' : 'ring-slate-200'} ${disabled ? 'opacity-50' : ''}`}
    >
      <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Digite uma mensagem..."
        aria-label="Mensagem"
        className="max-h-36 min-h-12 w-full resize-none overflow-y-auto bg-transparent px-1 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-violet-300"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Adicionar anexo"
              className="inline-flex size-8 items-center justify-center rounded-lg text-base text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <span aria-hidden="true">📎</span>
            </button>
            <button
              type="button"
              aria-label="Abrir câmera"
              className="inline-flex size-8 items-center justify-center rounded-lg text-base text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <span aria-hidden="true">📷</span>
            </button>
          </div>
          <button
            type="button"
            onClick={toggleRole}
            aria-pressed={isBotMode}
            aria-label={`Enviar como ${isBotMode ? 'Usuario' : 'Robo'}`}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${isBotMode ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-700'}`}
          >
            <span aria-hidden="true">{isBotMode ? '🤖' : '🙂'}</span>
            <span>{isBotMode ? 'Robo' : 'Usuario'}</span>
          </button>
        </div>
        <button
          type="submit"
          disabled={!hasContent}
          aria-label="Enviar mensagem"
          className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-600 text-lg text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <span aria-hidden="true">↑</span>
        </button>
      </div>
      </fieldset>
    </form>
  )
}
