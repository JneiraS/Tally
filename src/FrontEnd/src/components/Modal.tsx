import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Arrière-plan semi-transparent */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteneur de modale */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClass} bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-nord-2 z-10 overflow-hidden my-8`}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-nord-2 bg-slate-50/50 dark:bg-nord-0/50">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-nord-6">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-nord-4 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-nord-4 dark:hover:text-nord-6 hover:bg-slate-100 dark:hover:bg-nord-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
