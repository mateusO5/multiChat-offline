import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useChatStore } from './stores/useChatStore'

describe('multi-chat app', () => {
  beforeEach(() => {
    let nextId = 0
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `conversation-${++nextId}`) })
    useChatStore.setState({ conversations: {}, activeConversationId: null, nextContactGender: 'woman' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts with a disabled composer and enables it for a new conversation', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Nenhuma conversa selecionada' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Mensagem' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviar como Robo' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Nova conversa' }))

    expect(screen.getByRole('heading', { name: 'Comece uma conversa' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Mensagem' })).toBeEnabled()
  })

  it('shows the newest message and replaces the generated phone with the saved contact name', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Nova conversa' }))

    const conversation = useChatStore.getState().conversations['conversation-1']
    expect(screen.getByText(conversation.contactNumber)).toBeInTheDocument()
    expect(screen.getByText(conversation.contactName)).toBeInTheDocument()
    expect(screen.queryByText(conversation.id)).not.toBeInTheDocument()

    const composer = screen.getByRole('textbox', { name: 'Mensagem' })
    await user.type(composer, 'Mensagem mais recente')
    await user.keyboard('{Enter}')
    expect(screen.getAllByText('Mensagem mais recente')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: `Salvar contato ${conversation.contactNumber}` }))
    const nameInput = screen.getByRole('textbox', { name: 'Nome salvo para o contato' })
    await user.type(nameInput, 'Contato personalizado')
    await user.click(screen.getByRole('button', { name: 'Salvar contato' }))

    expect(screen.getByText('Contato personalizado')).toBeInTheDocument()
    expect(screen.queryByText(conversation.contactNumber)).not.toBeInTheDocument()
    expect(screen.queryByText(conversation.contactName)).not.toBeInTheDocument()
    expect(screen.getAllByText('Mensagem mais recente')).toHaveLength(2)
  })

  it('preserves composer draft and persona across chats and closes the mobile drawer with Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Nova conversa' }))

    const composer = screen.getByRole('textbox', { name: 'Mensagem' })
    await user.type(composer, 'Rascunho preservado')
    await user.click(screen.getByRole('button', { name: 'Enviar como Robo' }))

    await user.click(screen.getByRole('button', { name: 'Abrir conversas' }))
    const mobileSidebar = document.getElementById('mobile-conversation-sidebar')
    expect(mobileSidebar).not.toBeNull()
    await user.click(screen.getAllByRole('button', { name: 'Nova conversa' }).at(-1)!)

    expect(composer).toHaveValue('Rascunho preservado')
    expect(screen.getByRole('button', { name: 'Enviar como Usuario' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Abrir conversas' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.getElementById('mobile-conversation-sidebar')).toBeNull()
  })
})
