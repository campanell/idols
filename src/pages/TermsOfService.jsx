import React from 'react';
import ReactMarkdown from 'react-markdown';
import termsText from '../../i4l_terms_of_service_complete.txt?raw';

export default function TermsOfService() {
  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen flex justify-center">
      <article className="bg-white rounded-xl p-6 shadow-md max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-indigo-800 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-6">Effective Date: March 1, 2025</p>
        <div className="prose prose-lg max-w-none text-gray-800">
          <ReactMarkdown
            components={{
              a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800" {...props} />,
              strong: ({node, ...props}) => <strong className="text-indigo-800" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {termsText.replace(/\[insert contact email\]/g, 'TODO: Add contact email')}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
} 