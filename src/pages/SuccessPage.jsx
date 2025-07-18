import React from 'react';
import { Link } from 'react-router-dom';

const SuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful! 🌸 Welcome to the Founders Circle  </h1>
        <p className="text-gray-700 mb-4">Thank you for your membership. We are honored to have you with us at the very beginning.</p>
        <p className="text-gray-700 mb-4">You are one of just 70 visionary members who believed in the dream: by 2040, virtual idols will become the cultural icons of a new generation of celebrities, and you're helping make it real. Together, we will shape the next generation of idols, powered by music, story, and your imagination.</p>
        <p className="text-gray-700 mb-4">Thank you again for believing in this vision.  Check your email for your membership card and access to the Founders Circle Discord community.  Contact us at <a href="mailto:support@idols4life.com">support@idols4life.com</a> if you have any questions.</p>
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;