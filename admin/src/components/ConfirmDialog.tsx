"use client";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", busy, onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="m-0 text-xl">{title}</h3>
        <p className="m-0 text-sm opacity-85">{message}</p>
        <div className="mt-2 flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
