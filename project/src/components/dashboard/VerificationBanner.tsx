import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

type VerificationStatus = 'none' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface VerificationBannerProps {
  status?: VerificationStatus;      // default: 'none'
  onOpen: () => void;
  onDismiss?: () => void;           // optional close button
  className?: string;
}

const variants = {
  none: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 shrink-0" />,
    title: 'Complete Your Verification',
    desc: 'Upload your verification documents to build trust with renters and unlock full platform features.',
    cta: 'Upload Documents',
    ctaColor: 'bg-blue-900 hover:bg-blue-800',
    textTitle: 'text-amber-800',
    textDesc: 'text-amber-700',
  },
  pending: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Clock className="h-5 w-5 text-blue-600 mt-1 shrink-0" />,
    title: 'Verification Submitted',
    desc: 'We’re reviewing your documents. You’ll be notified when this is complete.',
    cta: 'View Submission',
    ctaColor: 'bg-blue-900 hover:bg-blue-800',
    textTitle: 'text-blue-900',
    textDesc: 'text-blue-700',
  },
  in_review: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Clock className="h-5 w-5 text-blue-600 mt-1 shrink-0" />,
    title: 'Verification In Review',
    desc: 'Your documents are being reviewed by our team.',
    cta: 'View Submission',
    ctaColor: 'bg-blue-900 hover:bg-blue-800',
    textTitle: 'text-blue-900',
    textDesc: 'text-blue-700',
  },
  rejected: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: <XCircle className="h-5 w-5 text-rose-600 mt-1 shrink-0" />,
    title: 'Verification Needs Attention',
    desc: 'Some documents were rejected. Update and resubmit to continue.',
    cta: 'Update Documents',
    ctaColor: 'bg-rose-600 hover:bg-rose-500',
    textTitle: 'text-rose-900',
    textDesc: 'text-rose-700',
  },
  approved: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 shrink-0" />,
    title: 'You’re Verified',
    desc: 'Your account has been verified. Thanks for helping keep the community safe.',
    cta: 'View Details',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
    textTitle: 'text-emerald-900',
    textDesc: 'text-emerald-700',
  },
} as const;

const VerificationBanner: React.FC<VerificationBannerProps> = ({
  status = 'none',
  onOpen,
  onDismiss,
  className = '',
}) => {
  const v = variants[status];

  // If you’d rather hide the banner when approved, just return null for that state:
  // if (status === 'approved') return null;

  return (
    <section
      role="status"
      aria-live="polite"
      className={`w-full ${v.bg} ${v.border} border rounded-2xl px-6 py-4 shadow-sm mb-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{v.icon}</div>
          <div>
            <h3 className={`text-sm font-medium ${v.textTitle}`}>
              {v.title}
            </h3>
            <p className={`text-sm mt-1 ${v.textDesc}`}>
              {v.desc}
            </p>
          </div>
        </div>

        {/* Only show buttons for the 'none' status (upload documents) */}
        {status === 'none' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpen}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${v.ctaColor} whitespace-nowrap`}
            >
              {v.cta}
            </button>

            {onDismiss && (
              <button
                title="Dismiss"
                aria-label="Dismiss verification banner"
                onClick={onDismiss}
                className="hidden sm:inline-flex items-center justify-center rounded-lg p-2 hover:bg-black/5 transition"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default VerificationBanner;
