import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Not Approved</h1>
        <p className="text-gray-700 mb-4">Your payment was not approved.  There are several reasons this might happen.  If you have any questions, please contact our support team at <a href="mailto:support@idols4life.com">support@idols4life.com</a>.</p>
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default CancelPage;