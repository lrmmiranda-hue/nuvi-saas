import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Trash2, 
  X 
} from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AlertDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: DialogVariant;
  onConfirm?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isConfirmMode: boolean; // true = confirm (2 buttons), false = alert (1 button)
  variant: DialogVariant;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  isConfirmMode,
  variant,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50',
          accentBorder: 'border-red-500/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-950/50 font-bold',
          accentBorder: 'border-amber-500/30',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50',
          accentBorder: 'border-emerald-500/30',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-sky-400" />,
          iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          confirmBtn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/50',
          accentBorder: 'border-sky-500/30',
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md rounded-2xl bg-neutral-900 border ${vStyle.accentBorder} shadow-2xl overflow-hidden p-6 relative space-y-5 animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4 pr-6">
          <div className={`p-3 rounded-xl border shrink-0 ${vStyle.iconBg}`}>
            {vStyle.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800/80">
          {isConfirmMode && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-sm font-medium transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.98] ${vStyle.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

