import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-indigo-800 text-pink-100 py-4 mt-12">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm mb-2 sm:mb-0">
          &copy; {new Date().getFullYear()} I4L Creative Studio. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <Link to="/privacy-policy" className="hover:text-white underline">
            Privacy Policy
          </Link>
          <span className="text-pink-300">|</span>
          <Link to="/terms-of-service" className="hover:text-white underline">
            Terms of Service
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 mt-2 text-center sm:text-right">
        <a href="mailto:service@idols4life.com" className="underline hover:text-white text-sm">service@idols4life.com</a>
      </div>
    </footer>
  );
} 