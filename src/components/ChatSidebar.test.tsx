import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatSidebar } from './ChatSidebar'
import type { ChatConversation } from '../types/conversation'

const conversations: ChatConversation[] = [
  { id: 'chat-123', messages: [], updatedAt: 2, pendingResponses: 0 },
  { id: 'chat-456', name: 'Planejamento', messages: [], updatedAt: 1, pendingResponses: 0 },
]

function renderSidebar(isMobileOpen = false) {
  const props = {
    conversations,
    activeConversationId: 'chat-123',
    isMobileOpen,
    onCreateConversation: vi.fn(),
    onSelectConversation: vi.fn(),
    onRenameConversation: vi.fn((_, name: string) => Boolean(name.trim())),
    onDeleteConversation: vi.fn(),
    onCloseMobile: vi.fn(),
  }

  return { ...render(<ChatSidebar {...props} />), props }
}

describe('ChatSidebar', () => {
  it('shows full IDs, names, and the active conversation', () => {
    renderSidebar()

    expect(screen.getByText('chat-123')).toBeInTheDocument()
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Selecionar conversa chat-123' })).toHaveAttribute('aria-current', 'page')
  })

  it('creates a conversation through the sidebar action', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Nova conversa' }))
    expect(props.onCreateConversation).toHaveBeenCalledOnce()
  })

  it('supports keyboard renaming and rejects blank names', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Renomear conversa chat-123' }))
    const input = screen.getByRole('textbox', { name: 'Nome da conversa' })
    await user.clear(input)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(props.onRenameConversation).toHaveBeenCalledWith('chat-123', '   ')
    expect(input).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '  Reuniao  ')
    await user.keyboard('{Enter}')
    expect(props.onRenameConversation).toHaveBeenLastCalledWith('chat-123', '  Reuniao  ')
    expect(screen.queryByRole('textbox', { name: 'Nome da conversa' })).not.toBeInTheDocument()
  })

  it('requires confirmation before deleting a conversation', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Excluir conversa chat-123' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/todo o seu histórico serão excluídos/)).toBeInTheDocument()
    expect(props.onDeleteConversation).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir conversa' }))
    expect(props.onDeleteConversation).toHaveBeenCalledWith('chat-123')
  })

  it('closes the mobile drawer after selecting a conversation', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar(true)

    const mobileSidebar = document.getElementById('mobile-conversation-sidebar')
    expect(mobileSidebar).not.toBeNull()
    await user.click(within(mobileSidebar!).getByRole('button', { name: 'Selecionar conversa Planejamento' }))
    expect(props.onSelectConversation).toHaveBeenCalledWith('chat-456')
    expect(props.onCloseMobile).toHaveBeenCalledOnce()
  })

  it('closes the mobile drawer when the backdrop is activated', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar(true)

    await user.click(screen.getByRole('button', { name: 'Fechar menu de conversas' }))
    expect(props.onCloseMobile).toHaveBeenCalledOnce()
  })
})
