import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there's a previous page in history, go back to it
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            These terms and conditions outline the rules and regulations for the use of OneRental's Website, located at www.onerental.com.
          </p>
          
          <h2>2. User Agreement</h2>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use OneRental if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          
          <h2>3. Privacy Policy</h2>
          <p>
            Please read our Privacy Policy.
          </p>
          
          <h2>4. License</h2>
          <p>
            Unless otherwise stated, OneRental and/or its licensors own the intellectual property rights for all material on OneRental. All intellectual property rights are reserved. You may access this from OneRental for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          
          <h2>5. Rental Terms</h2>
          <p>
            <strong>Payment Terms:</strong>
            <ul>
              <li>Payments must be made in full before rental period begins</li>
              <li>No refunds for early terminations</li>
              <li>Additional fees may apply for late returns</li>
            </ul>
          </p>
          
          <p>
            <strong>Equipment Usage:</strong>
            <ul>
              <li>Equipment must be returned in same condition as received</li>
              <li>Damage fees may apply for any damage to equipment</li>
              <li>Equipment must be used for intended purposes only</li>
            </ul>
          </p>
          
          <h2>6. Liability</h2>
          <p>
            In no event shall OneRental nor its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on OneRental's website, even if OneRental or a OneRental authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2>7. Accuracy of Materials</h2>
          <p>
            The materials appearing on OneRental's website could include technical, typographical, or photographic errors. OneRental does not warrant that any of the materials on its website are accurate, complete or current.
          </p>
          
          <h2>8. Changes to Terms</h2>
          <p>
            OneRental may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
