import React, { useCallback, useEffect, useRef, useState } from 'react';

type RequiredDoc = {
  key: string;               // e.g., "id_doc"
  label: string;             // e.g., "Government ID"
  accept?: string;           // e.g., "image/jpeg,image/png,.pdf"
  required?: boolean;        // default true
};

interface VerificationModalProps {
  onClose: () => void;
  isOpen?: boolean;          // default true
  onSubmit?: (payload: {
    files: Record<string, File | null>;
    extras: { agree: boolean; notes?: string; company_reg_number?: string };
  }) => Promise<void> | void;
  requiredDocs?: RequiredDoc[];
  maxFilesPerSlot?: number;  // currently 1 per slot, but leaving prop for future
  maxSizeMB?: number;        // default 10MB
}

type SlotState = {
  file: File | null;
  previewUrl?: string;
  error?: string | null;
  progress?: number;
};

const DEFAULT_DOCS: RequiredDoc[] = [
  { key: 'id_doc',        label: 'Government ID (front/back or PDF)', accept: 'image/jpeg,image/png,.pdf', required: true },
  { key: 'proof_address', label: 'Proof of Address (utility bill/bank stmt)', accept: 'image/jpeg,image/png,.pdf', required: true },
];

// ---- lightweight console logger (no Supabase) ----
type Lvl = 'debug' | 'info' | 'warn' | 'error';
const makeTraceId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2));
const clog = (level: Lvl, event: string, ctx?: Record<string, any>) => {
  const line = `[${new Date().toISOString()}][${level.toUpperCase()}] ${event}`;
  const payload = ctx ?? {};
  if (level === 'error') console.error(line, payload);
  else if (level === 'warn') console.warn(line, payload);
  else if (level === 'debug') console.debug(line, payload);
  else console.log(line, payload);
};
// --------------------------------------------------

const VerificationModal: React.FC<VerificationModalProps> = ({
  onClose,
  isOpen = true,
  onSubmit,
  requiredDocs = DEFAULT_DOCS,
  maxFilesPerSlot = 1,
  maxSizeMB = 10,
}) => {
  const [slots, setSlots] = useState<Record<string, SlotState>>({});
  const [agree, setAgree] = useState(false);
  const [notes, setNotes] = useState('');
  const [companyReg, setCompanyReg] = useState(''); // company registration number (optional)
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // one trace id for this modal session
  const [traceId] = useState(makeTraceId);

  // track all created preview URLs so we can revoke them on unmount reliably
  const previewUrlsRef = useRef<string[]>([]);

  // Reset form every time the modal opens; also initializes slots
  useEffect(() => {
    if (!isOpen) return;
    const init: Record<string, SlotState> = {};
    requiredDocs.forEach(doc => {
      init[doc.key] = { file: null, error: null, progress: undefined, previewUrl: undefined };
    });
    setSlots(init);
    setAgree(false);
    setNotes('');
    setCompanyReg('');
    setSubmitting(false);
    setIsVerified(false);

    clog('info', 'ui.modal.open', {
      traceId,
      required: requiredDocs.map(d => ({ key: d.key, required: d.required !== false })),
      maxSizeMB,
      maxFilesPerSlot,
    });
  }, [isOpen, requiredDocs, maxFilesPerSlot, maxSizeMB, traceId]);

  // esc to close
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clog('info', 'ui.modal.close.escape', { traceId });
        onClose();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose, traceId]);

  // revoke all previews on unmount (using the ref that records all created URLs)
  useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current) {
        try {
          URL.revokeObjectURL(url);
          clog('debug', 'ui.preview.revoke', { traceId, url });
        } catch {}
      }
      clog('info', 'ui.modal.unmount', { traceId });
    };
  }, [traceId]);

  const validateFile = (file: File, accept?: string): string | null => {
    if (!file) return 'No file selected';
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return `File too large (max ${maxSizeMB} MB)`;

    // accept patterns like "image/jpeg,image/png,.pdf"
    if (accept) {
      const parts = accept.split(',').map(s => s.trim()).filter(Boolean);
      const ok = parts.some(p => {
        if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -1));
        if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase());
        return file.type === p; // exact mime
      });
      if (!ok) return 'Unsupported file type';
    }
    return null;
  };

  const setSlotFile = useCallback((key: string, file: File | null, accept?: string) => {
    setSlots(prev => {
      const prevSlot = prev[key];

      // revoke previous preview if any
      if (prevSlot?.previewUrl) {
        try {
          URL.revokeObjectURL(prevSlot.previewUrl);
          clog('debug', 'ui.preview.revoke', { traceId, key, url: prevSlot.previewUrl });
        } catch {}
      }

      const error = file ? validateFile(file, accept) : null;
      const next: SlotState = { file, error, progress: undefined, previewUrl: undefined };

      if (!error && file && file.type.startsWith('image/')) {
        next.previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.push(next.previewUrl);
      }

      clog(error ? 'warn' : 'info', error ? 'ui.file.select.reject' : 'ui.file.select.accept', {
        traceId,
        key,
        name: file?.name ?? null,
        size: file?.size ?? null,
        type: file?.type ?? null,
        accept,
        error,
        hasPreview: !!next.previewUrl
      });

      return { ...prev, [key]: next };
    });
  }, [traceId, maxSizeMB]); // validateFile uses maxSizeMB

  const handleDrop = (e: React.DragEvent, key: string, accept?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0] ?? null;
    clog('info', 'ui.file.drop', {
      traceId,
      key,
      name: file?.name ?? null,
      size: file?.size ?? null,
      type: file?.type ?? null
    });
    setSlotFile(key, file, accept);
  };

  const allRequiredPresent = requiredDocs.every(doc => !doc.required || !!slots[doc.key]?.file);
  const anyErrors = Object.values(slots).some(s => s?.error);
  const canSubmit = allRequiredPresent && !anyErrors && agree && !submitting;

  const mockProgressTick = (key: string) => {
    setSlots(prev => {
      const s = prev[key];
      if (!s) return prev;
      const p = Math.min(100, (s.progress ?? 0) + 20);
      clog('debug', 'ui.progress.tick', { traceId, key, progress: p });
      return { ...prev, [key]: { ...s, progress: p } };
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      clog('warn', 'ui.submit.blocked', {
        traceId,
        reasons: { allRequiredPresent, anyErrors, agree, submitting }
      });
      return;
    }
    try {
      setSubmitting(true);
      clog('info', 'ui.submit.attempt', {
        traceId,
        selectedKeys: Object.entries(slots).filter(([_, v]) => !!v.file).map(([k]) => k),
        withNotes: !!notes.trim(),
        withCompanyReg: !!companyReg.trim(),
        agree
      });

      // simulate progress (UI-only; real uploads done in parent onSubmit)
      const keys = Object.keys(slots);
      for (const key of keys) {
        const s = slots[key];
        if (!s?.file) continue;
        for (let i = 0; i < 5; i++) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(res => setTimeout(res, 120));
          mockProgressTick(key);
        }
      }

      await onSubmit?.({
        files: Object.fromEntries(Object.entries(slots).map(([k, v]) => [k, v.file])),
        extras: {
          agree,
          notes: notes.trim() || undefined,
          company_reg_number: companyReg.trim() || undefined,
        },
      });

      setSubmitting(false);
      setIsVerified(true); // ⬅️ success UI only after submit resolves
      clog('info', 'ui.submit.ok', { traceId });
    } catch (err: any) {
      console.error('Verification submit failed:', err);
      clog('error', 'ui.submit.fail', { traceId, error: err?.message || String(err) });
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      clog('info', 'ui.modal.close.backdrop', { traceId });
      onClose();
    }
  };

  const handleCloseClick = () => {
    clog('info', 'ui.modal.close.button', { traceId });
    onClose();
  };

  if (!isOpen) return null;

  // Submitted state (shown ONLY after successful submit)
  if (isVerified) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Submitted</h3>
          <p className="text-sm text-gray-500 mb-6">
            Your documents have been submitted for verification. We'll review your information and get back to you soon.
          </p>
          <button
            type="button"
            onClick={handleCloseClick}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="verification-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="verification-title" className="text-xl font-bold text-gray-900">
            Complete Verification
          </h2>
          <button
            onClick={handleCloseClick}
            className="text-gray-500 hover:text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            Upload the required documents below. We accept JPG/PNG or PDF files. Max {maxSizeMB}MB each.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requiredDocs.map((doc) => {
              const slot = slots[doc.key] || {};
              return (
                <div key={doc.key} className="border rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    {doc.label} {doc.required !== false && <span className="text-red-500">*</span>}
                  </label>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => handleDrop(e, doc.key, doc.accept)}
                    className={[
                      'group relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center',
                      slot.error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400',
                      'transition'
                    ].join(' ')}
                  >
                    {!slot.file && (
                      <>
                        <div className="text-gray-500 text-sm">
                          Drag & drop here, or
                        </div>
                        <label className="mt-2 inline-block px-3 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700">
                          Browse file
                          <input
                            type="file"
                            accept={doc.accept || 'image/jpeg,image/png,.pdf'}
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setSlotFile(doc.key, f, doc.accept);
                              e.currentTarget.value = '';
                            }}
                          />
                        </label>
                        <div className="mt-2 text-xs text-gray-400">
                          Accepted: {doc.accept || 'JPG/PNG/PDF'} • Max {maxSizeMB}MB
                        </div>
                      </>
                    )}

                    {/* Preview / chosen file */}
                    {slot.file && (
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm text-gray-700 truncate">
                            {slot.file.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              clog('info', 'ui.file.remove', { traceId, key: doc.key, name: slot.file?.name });
                              setSlotFile(doc.key, null, doc.accept);
                            }}
                            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          >
                            Remove
                          </button>
                        </div>

                        {slot.previewUrl && (
                          <div className="mt-3">
                            <img
                              src={slot.previewUrl}
                              alt={`${doc.label} preview`}
                              className="w-full h-40 object-contain rounded"
                            />
                          </div>
                        )}

                        {/* Progress (stubbed for UI feel) */}
                        {typeof slot.progress === 'number' && slot.progress < 100 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${slot.progress}%` }}
                              />
                            </div>
                            <div className="mt-1 text-xs text-gray-500" aria-live="polite">{slot.progress}%</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {slot.error && (
                    <p className="mt-2 text-sm text-red-600" aria-live="assertive">{slot.error}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Company Reg Number (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Company Registration Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={companyReg}
                onChange={(e) => setCompanyReg(e.target.value)}
                placeholder="e.g. 2018/123456/07"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300"
                inputMode="text"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300"
              placeholder="Anything we should know about your documents?"
            />
          </div>

          {/* Consent */}
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                clog('debug', 'ui.consent.toggle', { traceId, agree: e.target.checked });
              }}
            />
            <span>
              I confirm these documents are accurate and I consent to their use for verification.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={handleCloseClick}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
          >
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
