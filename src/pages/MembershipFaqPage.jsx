import MembershipFaqAccordion from "@/components/MembershipFaqAccordion";

export default function MembershipFaqPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <section className="mx-auto w-full max-w-3xl space-y-4 rounded-xl bg-white p-5 shadow-md sm:p-6">
        <h1 className="text-2xl font-bold text-black">Membership FAQ</h1>
        <p className="text-sm text-gray-600">
          Answers to common questions about paid membership.
        </p>
        <MembershipFaqAccordion />
      </section>
    </main>
  );
}
