import React from "react";
import privacyPolicyText from "../../i4l_privacy_policy.txt?raw";

export default function PrivacyPolicy() {
  const normalizedPrivacyPolicyText = privacyPolicyText
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\n(\d+\.\s)/g, "\n\n$1");

  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen flex justify-center">
      <article className="bg-white rounded-xl p-6 shadow-md max-w-3xl w-full">
        <h1 className="mb-2 text-3xl font-bold text-black">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Effective Date: March 1, 2025</p>
        <div className="whitespace-pre-line text-lg leading-relaxed text-gray-800">
          {normalizedPrivacyPolicyText}
        </div>
      </article>
    </main>
  );
}