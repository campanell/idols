// src/components/Header.jsx
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative bg-indigo-800 text-pink-100 px-4 py-3 flex items-center justify-between">
      {/* Brand */}
      <div>
        <div className="text-xs">idols 4 life</div>
        <div className="text-3xl font-bold leading-none">I4L</div>
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center space-y-1"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-0.5 bg-pink-100" />
        <div className="w-6 h-0.5 bg-pink-100" />
        <div className="w-6 h-0.5 bg-pink-100" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <nav className="absolute top-full right-4 mt-2 bg-white text-indigo-900 rounded shadow-lg p-4 space-y-2 z-10">
          <a href="/" className="block hover:text-pink-700">Home</a>
          <a href="/about" className="block hover:text-pink-700">About</a>
          <a href="/membership" className="block hover:text-pink-700">Membership</a>
          <a href="/roster" className="block hover:text-pink-700">Roster</a>
          <a href="/blog" className="block hover:text-pink-700">Blog</a>
        </nav>
      )}
    </header>
  );
}
