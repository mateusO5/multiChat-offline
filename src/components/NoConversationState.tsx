export function NoConversationState() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-violet-100 text-2xl text-violet-700">
          💬
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Nenhuma conversa selecionada
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Crie ou selecione uma conversa para começar.
        </p>
      </div>
    </div>
  )
}
