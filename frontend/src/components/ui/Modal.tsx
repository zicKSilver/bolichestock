import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  maxWidth?: string
}

export default function Modal({ open, onOpenChange, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-xl border border-borde bg-tarjeta p-6 shadow-2xl shadow-black/50 ${maxWidth}`}>
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-gray-400 transition hover:bg-white/10 hover:text-white">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
