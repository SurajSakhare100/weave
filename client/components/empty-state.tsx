interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#cf1a53] text-lg">{message}</p>
    </div>
  )
}
