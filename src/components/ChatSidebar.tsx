import { useEffect, useRef, useState } from 'react'
import type { ChatConversation } from '../types/conversation'

type ChatSidebarProps = {
  conversations: ChatConversation[]
  activeConversationId: string | null
  isMobileOpen: boolean
  onCreateConversation: () => void
  onSelectConversation: (conversationId: string) => void
  onRenameConversation: (conversationId: string, name: string) => boolean
  onDeleteConversation: (conversationId: string) => void
  onCloseMobile: () => void
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  isMobileOpen,
  onCreateConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onCloseMobile,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ChatConversation | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const mobileCreateButtonRef = useRef<HTMLButtonElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (deleteTarget && !dialog.open) {
      dialog.showModal()
    } else if (!deleteTarget && dialog.open) {
      dialog.close()
    }
  }, [deleteTarget])

  function beginRename(conversation: ChatConversation) {
    setEditingId(conversation.id)
    setEditedName(conversation.name ?? '')
  }

  function saveRename(conversationId: string) {
    if (onRenameConversation(conversationId, editedName)) {
      setEditingId(null)
      setEditedName('')
    }
  }

  function closeDeleteDialog() {
    setDeleteTarget(null)
    dialogRef.current?.close()
  }

  function confirmDelete() {
    if (!deleteTarget) return
    onDeleteConversation(deleteTarget.id)
    closeDeleteDialog()
  }

  function renderConversationList(isMobile = false) {
    return (
      <ul className="space-y-1" aria-label="Conversas">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId
          const isEditing = conversation.id === editingId

          return (
            <li key={conversation.id} className={`rounded-xl p-2 ${isActive ? 'bg-violet-100' : 'hover:bg-slate-100'}`}>
              {isEditing ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveRename(conversation.id)
                  }}
                  className="space-y-2"
                >
                  <label className="sr-only" htmlFor={`rename-${conversation.id}`}>Nome da conversa</label>
                  <input
                    id={`rename-${conversation.id}`}
                    autoFocus
                    value={editedName}
                    onChange={(event) => setEditedName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setEditingId(null)
                        setEditedName('')
                      }
                    }}
                    placeholder="Nome da conversa"
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-md bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-700">Salvar</button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setEditedName('')
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => {
                      onSelectConversation(conversation.id)
                      if (isMobile) onCloseMobile()
                    }}
                    className="block w-full min-w-0 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                  >
                    <span className={`block text-sm font-medium text-slate-800 ${conversation.name ? 'truncate' : 'break-all'}`}>
                      {conversation.name || conversation.id}
                    </span>
                    {conversation.name && (
                      <span className="mt-0.5 block break-all text-xs text-slate-500">{conversation.id}</span>
                    )}
                  </button>
                  <div className="mt-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => beginRename(conversation)}
                      aria-label={`Renomear conversa ${conversation.name || conversation.id}`}
                      className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-violet-600"
                    >
                      Renomear
                    </button>
                    <button
                      ref={isActive ? deleteButtonRef : undefined}
                      type="button"
                      onClick={(event) => {
                        deleteButtonRef.current = event.currentTarget
                        setDeleteTarget(conversation)
                      }}
                      aria-label={`Excluir conversa ${conversation.name || conversation.id}`}
                      className="rounded-md px-2 py-1 text-xs text-rose-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-rose-600"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  function renderSidebar(isMobile = false) {
    return (
      <aside
        id={isMobile ? 'mobile-conversation-sidebar' : undefined}
        aria-label="Navegação de conversas"
        className={`w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-4 ${isMobile ? 'flex h-full shadow-2xl' : 'hidden md:flex'}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Chat offline</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Conversas</h2>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar conversas"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-violet-600"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        <button
          ref={isMobile ? mobileCreateButtonRef : createButtonRef}
          type="button"
          onClick={() => {
            onCreateConversation()
            if (isMobile) onCloseMobile()
          }}
          className="mb-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
        >
          <span aria-hidden="true">＋</span>
          Nova conversa
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.length ? renderConversationList(isMobile) : (
            <p className="px-2 py-4 text-sm leading-6 text-slate-500">Suas conversas aparecerão aqui.</p>
          )}
        </div>
      </aside>
    )
  }

  return (
    <>
      {renderSidebar()}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu de conversas"
            onClick={onCloseMobile}
            className="absolute inset-0 size-full bg-slate-950/40"
          />
          <div className="absolute inset-y-0 left-0">{renderSidebar(true)}</div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-conversation-title"
        aria-describedby="delete-conversation-description"
        onClose={() => {
          setDeleteTarget(null)
          if (deleteButtonRef.current?.isConnected) {
            deleteButtonRef.current.focus()
          } else {
            const fallbackButton = mobileCreateButtonRef.current ?? createButtonRef.current
            fallbackButton?.focus()
          }
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-950/40"
      >
        {deleteTarget && (
          <div className="p-6">
            <h2 id="delete-conversation-title" className="text-lg font-semibold text-slate-900">Excluir conversa?</h2>
            <p id="delete-conversation-description" className="mt-2 break-all text-sm leading-6 text-slate-600">
              A conversa “{deleteTarget.name || deleteTarget.id}” e todo o seu histórico serão excluídos desta sessão.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={closeDeleteDialog}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-violet-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              >
                Excluir conversa
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}