import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatSidebar } from './ChatSidebar'
import type { ChatConversation } from '../types/conversation'

const conversations: ChatConversation[] = [
  {
    id: 'internal-secret-123',
    contactNumber: '(11) 99876-5432',
    contactName: 'Ana Souza',
    contactGender: 'woman',
    messages: [{ id: 'message-1', role: 'user', content: 'Oi, tudo bem?', createdAt: 1 }],
    updatedAt: 2,
    pendingResponses: 0,
  },
  {
    id: 'internal-secret-456',
    contactNumber: '(21) 91234-5678',
    contactName: 'Bruno Lima',
    contactGender: 'man',
    name: 'Planejamento',
    messages: [],
    updatedAt: 1,
    pendingResponses: 0,
  },
]

function renderSidebar(isMobileOpen = false) {
  const props = {
    conversations,
    activeConversationId: 'internal-secret-123',
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
  it('shows phone, generated person, last message and custom name without exposing IDs', () => {
    renderSidebar()

    expect(screen.getByText('(11) 99876-5432')).toBeInTheDocument()
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('Oi, tudo bem?')).toBeInTheDocument()
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
    expect(screen.queryByText('internal-secret-123')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Selecionar conversa (11) 99876-5432' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not show a message preview when a conversation has no messages', () => {
    renderSidebar()

    expect(screen.queryByText('Nenhuma mensagem ainda')).not.toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'Salvar contato (11) 99876-5432' }))
    const input = screen.getByRole('textbox', { name: 'Nome salvo para o contato' })
    await user.clear(input)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(props.onRenameConversation).toHaveBeenCalledWith('internal-secret-123', '   ')
    expect(input).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '  Reuniao  ')
    await user.keyboard('{Enter}')
    expect(props.onRenameConversation).toHaveBeenLastCalledWith('internal-secret-123', '  Reuniao  ')
    expect(screen.queryByRole('textbox', { name: 'Nome salvo para o contato' })).not.toBeInTheDocument()
  })

  it('requires confirmation before deleting a conversation', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Excluir conversa (11) 99876-5432' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/todo o seu histórico serão excluídos/)).toBeInTheDocument()
    expect(props.onDeleteConversation).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir conversa' }))
    expect(props.onDeleteConversation).toHaveBeenCalledWith('internal-secret-123')
  })

  it('closes the mobile drawer after selecting a conversation', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar(true)

    const mobileSidebar = document.getElementById('mobile-conversation-sidebar')
    expect(mobileSidebar).not.toBeNull()
    await user.click(within(mobileSidebar!).getByRole('button', { name: 'Selecionar conversa Planejamento' }))
    expect(props.onSelectConversation).toHaveBeenCalledWith('internal-secret-456')
    expect(props.onCloseMobile).toHaveBeenCalledOnce()
  })

  it('closes the mobile drawer when the backdrop is activated', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar(true)

    await user.click(screen.getByRole('button', { name: 'Fechar menu de conversas' }))
    expect(props.onCloseMobile).toHaveBeenCalledOnce()
  })
})
