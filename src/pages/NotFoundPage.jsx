import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <section className="mx-auto w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          404
        </p>
        <h1 className="text-2xl font-bold text-indigo-900">Page not found</h1>
        <p className="text-sm text-gray-600">
          This page does not exist or may have moved. Use one of the links
          below to continue.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Link
            to="/"
            className="inline-flex rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            Back to Home
          </Link>
          <Link
            to="/roster"
            className="inline-flex rounded-md border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-50"
          >
            View Roster
          </Link>
        </div>
      </section>
    </main>
  );
}
