import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Quando preenchido, exige que o usuário digite essa string para confirmar. */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  danger, requireText, onConfirm, onCancel,
}: Props) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  if (!open) return null;

  const disabled = requireText !== undefined && typed !== requireText;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {requireText !== undefined && (
          <div className="field">
            <label>Digite <strong>{requireText}</strong> para confirmar</label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
              autoFocus
            />
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'danger' : ''}
            disabled={disabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
