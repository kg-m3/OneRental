import React, { useState } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';

interface VerificationFormProps {
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    companyRegistration: '',
    taxNumber: '',
  });
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    idDocument: null,
    proofOfAddress: null,
    companyRegistration: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // Add documents
    Object.entries(documents).forEach(([key, file]) => {
      if (file) {
        data.append(key, file);
      }
    });

    onSubmit(data);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments((prev) => ({
        ...prev,
        [field]: e.target.files![0],
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white rounded-lg p-6 shadow-lg scrollbar-hide">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Account Verification
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-blue-800 font-medium">
                    Verification Requirements
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    To verify your account, please provide the following
                    documents:
                  </p>
                  <ul className="text-blue-600 text-sm mt-2 list-disc list-inside">
                    <li>Valid ID document or passport</li>
                    <li>Proof of address (not older than 3 months)</li>
                    <li>Company registration documents (if applicable)</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number / Passport Number
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Company Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.companyRegistration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyRegistration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Number
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, taxNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Document Upload
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Document / Passport
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'idDocument')}
                        className="hidden"
                        id="idDocument"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <label
                        htmlFor="idDocument"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {documents.idDocument
                            ? documents.idDocument.name
                            : 'Upload ID Document'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proof of Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'proofOfAddress')}
                        className="hidden"
                        id="proofOfAddress"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <label
                        htmlFor="proofOfAddress"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {documents.proofOfAddress
                            ? documents.proofOfAddress.name
                            : 'Upload Proof of Address'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Registration Document
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange(e, 'companyRegistration')
                        }
                        className="hidden"
                        id="companyRegistrationDoc"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor="companyRegistrationDoc"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {documents.companyRegistration
                            ? documents.companyRegistration.name
                            : 'Upload Company Registration'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
