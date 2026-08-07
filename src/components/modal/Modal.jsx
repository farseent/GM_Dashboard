import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop - now adapts to dark mode */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container - using theme tokens */}
      <div className={`relative w-[95%] ${SIZE_CLASSES[size]} rounded-2xl bg-surface-raised shadow-2xl animate-in slide-in-from-bottom-4 duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
          <h2 id="modal-title" className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-fg-subtle transition-all hover:bg-surface hover:text-fg hover:scale-105"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}