import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader, UserCircle, Building, Check, Upload, FileText, Shield, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    idNumber: '',
    companyRegistrationNumber: '',
    selectedRoles: [] as string[],
    termsAccepted: false,
    privacyPolicyAccepted: false,
    backgroundCheckConsent: false,
  });
  
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    companyRegistration: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.email && formData.password && formData.fullName && formData.phone;
      case 2:
        return formData.selectedRoles.length > 0;
      case 3:
        return true; // Allow skipping this step
      case 4:
        return formData.termsAccepted && formData.privacyPolicyAccepted && formData.backgroundCheckConsent;
      default:
        return false;
    }
  };

  const handleSkipVerification = () => {
    setCurrentStep(4);
    setError('');
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignIn) {
        await signIn(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        // For signup, only include verification data if documents were uploaded
        const hasDocuments = documents.idDocument || documents.proofOfAddress;
        const signupData = {
          email: formData.email,
          password: formData.password,
          roles: formData.selectedRoles,
          profile: {
            full_name: formData.fullName,
            phone: formData.phone,
            company_name: formData.companyName,
            // Only include verification fields if user uploaded documents
            ...(hasDocuments && {
              id_number: formData.idNumber,
              company_registration_number: formData.companyRegistrationNumber,
            }),
            background_check_status: hasDocuments ? 'in_review' : 'pending',
            terms_accepted: formData.termsAccepted,
            privacy_policy_accepted: formData.privacyPolicyAccepted,
            background_check_consent: formData.backgroundCheckConsent,
          }
        };
        
        await signUp(formData.email, formData.password, formData.selectedRoles);
        // TODO: Handle document uploads and profile creation with signupData
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
      >
        {loading ? <Loader className="h-5 w-5 animate-spin" /> : 'Sign in'}
      </button>
    </form>
  );

  const renderSignUpStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4">Personal Information</h3>
            
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                placeholder="Phone Number"
              />
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Company Name (Optional)"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4">Account Type</h3>
            <p className="text-sm text-gray-600 mb-4">Select the type(s) of account you need:</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => toggleRole('renter')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.selectedRoles.includes('renter')
                    ? 'border-blue-800 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Equipment Renter</h4>
                    <p className="text-sm text-gray-500">Browse and rent construction equipment</p>
                  </div>
                  {formData.selectedRoles.includes('renter') && <Check className="h-5 w-5 text-blue-700" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleRole('owner')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.selectedRoles.includes('owner')
                    ? 'border-blue-800 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Equipment Owner</h4>
                    <p className="text-sm text-gray-500">List and manage your construction equipment</p>
                  </div>
                  {formData.selectedRoles.includes('owner') && <Check className="h-5 w-5 text-blue-700" />}
                </div>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4">Verification Documents</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-blue-800 font-medium">Why verify your account?</h4>
                  <p className="text-blue-600 text-sm mt-1">
                    Verification helps build trust in our community and ensures secure transactions. 
                    You can skip this step for now and complete it later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number / Passport Number *</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                placeholder="Enter your ID or passport number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Registration Number</label>
              <input
                type="text"
                value={formData.companyRegistrationNumber}
                onChange={(e) => handleInputChange('companyRegistrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                placeholder="Enter company registration number (if applicable)"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Document *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={(e) => handleFileChange('idDocument', e.target.files?.[0] || null)}
                  className="hidden"
                  id="idDocument"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="idDocument"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {documents.idDocument ? documents.idDocument.name : 'Upload ID Document'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Address *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={(e) => handleFileChange('proofOfAddress', e.target.files?.[0] || null)}
                  className="hidden"
                  id="proofOfAddress"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="proofOfAddress"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {documents.proofOfAddress ? documents.proofOfAddress.name : 'Upload Proof of Address'}
                  </span>
                </label>
              </div>
            </div>

            {formData.companyRegistrationNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Registration Document</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('companyRegistration', e.target.files?.[0] || null)}
                    className="hidden"
                    id="companyRegistration"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="companyRegistration"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {documents.companyRegistration ? documents.companyRegistration.name : 'Upload Company Registration'}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4">Terms and Verification Consent</h3>
            
            {!formData.idNumber && !documents.idDocument && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-amber-800 font-medium">Verification Pending</h4>
                    <p className="text-amber-600 text-sm mt-1">
                      You've chosen to skip document upload. You can complete verification anytime from your dashboard 
                      to unlock full platform features and build trust with other users.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-blue-800 font-medium">Background Verification Process</h4>
                  <p className="text-blue-600 text-sm mt-1">
                    To ensure the safety and security of our platform, we conduct background checks on all users.
                    This includes verifying your identity, address, and business credentials (if applicable).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-amber-800 font-medium">Important Notice</h4>
                  <p className="text-amber-600 text-sm mt-1">
                    Your account will be pending approval until our verification process is complete.
                    This typically takes 2-5 business days. You will be notified via email once your account is approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded mt-1"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I have read and agree to the{' '}
                  <Link to="/terms" className="text-blue-800 hover:text-blue-700 underline">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.privacyPolicyAccepted}
                  onChange={(e) => handleInputChange('privacyPolicyAccepted', e.target.checked)}
                  className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded mt-1"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I have read and agree to the{' '}
                  <Link to="/privacy" className="text-blue-800 hover:text-blue-700 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.backgroundCheckConsent}
                  onChange={(e) => handleInputChange('backgroundCheckConsent', e.target.checked)}
                  className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded mt-1"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I consent to background verification checks including identity verification,
                  address verification, and business credential verification (where applicable).
                  I understand this is required for platform security.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-800">
            {isSignIn ? 'Sign in to your account' : 'Create your account'}
          </h2>
          {!isSignIn && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-blue-700 text-white'
                        : step < currentStep
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-4 w-4" /> : step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {isSignIn ? (
          renderSignInForm()
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {renderSignUpStep()}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              {currentStep === 3 ? (
                <div className="ml-auto flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSkipVerification}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!formData.idNumber || !documents.idDocument || !documents.proofOfAddress}
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              ) : currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="ml-auto px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(currentStep)}
                  className="ml-auto px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignIn(!isSignIn);
              setCurrentStep(1);
              setError('');
              setFormData({
                email: '',
                password: '',
                fullName: '',
                companyName: '',
                phone: '',
                idNumber: '',
                companyRegistrationNumber: '',
                selectedRoles: [],
                termsAccepted: false,
                privacyPolicyAccepted: false,
                backgroundCheckConsent: false,
              });
            }}
            className="text-sm text-blue-800 hover:text-blue-700"
          >
            {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;