'use client'
import React from 'react'

type Props = {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, onConfirm, onCancel }: Props) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="card relative w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost">{cancelLabel}</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
