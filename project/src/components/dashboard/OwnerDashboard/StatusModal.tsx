import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
  duration?: number;
}

const StatusModal: React.FC<StatusModalProps> = ({ 
  isOpen, 
  onClose, 
  status, 
  message, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icon = status === 'success' ? (
    <CheckCircle2 className="h-12 w-12 text-green-500" />
  ) : (
    <XCircle className="h-12 w-12 text-red-500" />
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {status === 'success' ? 'Success!' : 'Error!'}
          </h3>
          <p className="text-gray-600">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
