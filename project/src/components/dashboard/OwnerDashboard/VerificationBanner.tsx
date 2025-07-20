import { AlertTriangle } from 'lucide-react';

interface VerificationBannerProps {
  onOpen: () => void;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ onOpen }) => (
  <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 shadow-sm mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
        <div className="min-w-0">
          <h4 className="text-amber-800 font-semibold text-base leading-snug">
            Complete Your Verification
          </h4>
          <p className="text-amber-700 text-sm mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            Upload your verification documents to build trust with renters and unlock full platform features.
          </p>
        </div>
      </div>
      <div className="w-full sm:w-auto">
        <button
          onClick={onOpen}
          className="w-full sm:w-auto px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-800 transition"
        >
          Upload Documents
        </button>
      </div>
    </div>
  </div>
);

export default VerificationBanner;
