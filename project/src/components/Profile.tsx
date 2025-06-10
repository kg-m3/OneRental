import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Upload, Shield, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    profile_image_url: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationData, setVerificationData] = useState({
    company_reg_number: '',
    id_document: null,
    address_proof: null,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          profile_image_url: data.profile_image_url || '',
        });
        setTermsAccepted(data.terms_accepted || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          company_name: profile.company_name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_image_url: publicUrl });
      setSuccess('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({ terms_accepted: true, terms_accepted_at: new Date().toISOString() })
        .eq('user_id', user?.id);

      if (error) throw error;
      setSuccess('Terms and conditions accepted successfully');
      setTermsAccepted(true);
    } catch (error) {
      console.error('Error accepting terms:', error);
      setError('Failed to accept terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Handle file uploads
      const formData = new FormData();
      formData.append('company_reg_number', verificationData.company_reg_number);
      if (verificationData.id_document) {
        formData.append('id_document', verificationData.id_document);
      }
      if (verificationData.address_proof) {
        formData.append('address_proof', verificationData.address_proof);
      }

      const { error } = await supabase
        .from('user_verifications')
        .insert({
          user_id: user?.id,
          company_reg_number: verificationData.company_reg_number,
          id_document_url: '', // Will be updated after upload
          address_proof_url: '', // Will be updated after upload
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Handle file uploads to Supabase storage
      if (verificationData.id_document) {
        const { error: idError } = await supabase.storage
          .from('verification-documents')
          .upload(`id_${user?.id}_${Date.now()}`, verificationData.id_document);
        if (idError) throw idError;
      }

      if (verificationData.address_proof) {
        const { error: addressError } = await supabase.storage
          .from('verification-documents')
          .upload(`address_${user?.id}_${Date.now()}`, verificationData.address_proof);
        if (addressError) throw addressError;
      }

      setSuccess('Verification documents submitted successfully');
      setIsVerifying(false);
    } catch (error) {
      console.error('Error verifying account:', error);
      setError('Failed to submit verification documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            </div>

            {(error || success) && (
              <div className={`p-4 ${error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {error || success}
              </div>
            )}

            <div className="p-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-24 w-24 text-gray-400 border-2 rounded-full p-4" />
                  )}
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-blue-900 text-white rounded-full p-2 cursor-pointer hover:bg-blue-800"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile.full_name || 'Update your profile'}</h2>
                  <p className="text-gray-500">{profile.email}</p>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {setIsEditing(false);setLoading(false);}}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                      >
                       {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                        </>
                      ) : (
                        'Save Changes'
                      )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>

              {/* Terms and Conditions Section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-4">
                    <p className="text-gray-600">
                      By accepting these terms and conditions, you agree to:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 text-gray-600">
                      <li>Comply with all rental agreements and policies</li>
                      <li>Use equipment only for intended purposes</li>
                      <li>Return equipment in good condition</li>
                      <li>Follow all safety guidelines</li>
                      <li>Report any issues promptly</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      className="w-4 h-4 text-blue-900 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I have read and agree to the terms and conditions
                    </label>
                  </div>
                  {!termsAccepted ? (
                    <button
                      onClick={handleAcceptTerms}
                      disabled={loading}
                      className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          Accepting...
                        </>
                      ) : (
                        'Accept Terms'
                      )}
                    </button>
                  ) : (
                    <p className="mt-4 text-green-600">Terms and conditions accepted</p>
                  )}
                </div>
              </div>

              {/* Verification Section */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-900" />
                    <h3 className="text-lg font-semibold">Account Verification</h3>
                  </div>
                  <button
                    onClick={() => setIsVerifying(true)}
                    className="px-4 py-2 border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50"
                  >
                    Verify Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Verify Your Account</h2>
              <button
                onClick={() => setIsVerifying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleVerificationSubmit} className="p-6">
              <p className="text-gray-600 mb-4">
                To verify your account, please provide the following information:
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Registration Number
                  </label>
                  <input
                    type="text"
                    value={verificationData.company_reg_number}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      company_reg_number: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Government-issued ID
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      id_document: e.target.files?.[0]
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Address
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      address_proof: e.target.files?.[0]
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Verification'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;