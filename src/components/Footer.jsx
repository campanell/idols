import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#DB0011] py-4 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between px-4 sm:flex-row">
        <div className="mb-2 text-sm sm:mb-0">
          &copy; {new Date().getFullYear()} I4L Creative Studio. All rights
          reserved.
        </div>
        <div className="flex space-x-4">
          <Link to="/faq" className="underline hover:text-white">
            FAQ
          </Link>
          <span className="text-white/70">|</span>
          <Link to="/privacy-policy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          <span className="text-white/70">|</span>
          <Link to="/terms-of-service" className="underline hover:text-white">
            Terms of Service
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-3xl px-4 text-center sm:text-right">
        <a
          href="mailto:service@idols4life.com"
          className="text-sm underline hover:text-white"
        >
          service@idols4life.com
        </a>
      </div>
    </footer>
  );
}
