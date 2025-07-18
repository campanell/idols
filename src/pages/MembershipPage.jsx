import CheckoutButton from './StripeCheckout';
import { membershipContent } from "../data/membershipPageContent.js";

export default function MembershipPage() {
  const { hero, benefits, roster, vision, scarcity, howItWorks, faq, finalCta } = membershipContent;

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{hero.headline}</h1>
        <p className="text-lg text-gray-700">{hero.subheadline}</p>
        <CheckoutButton>
          {hero.cta}
        </CheckoutButton>
      </section>

      {/* Benefits Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Why Join the Founders Circle?</h2>
        <ul className="space-y-6">
          {benefits.map(({ title, description }) => (
            <li key={title}>
              <h3 className="text-xl font-medium">{title}</h3>
              <p className="text-gray-700">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Roster Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Meet the Virtual Idols You'll Help Shape</h2>
        <p className="text-center text-gray-700 mb-6">
          Our creative studio features three original anime-style acts, each with their own style, story, and fan energy. As a Founders Circle member,
          you'll help guide what they become.
        </p>
        <ul className="space-y-6">
          {roster.map(({ name, description }) => (
            <li key={name}>
              <h3 className="text-xl font-medium">{name}</h3>
              <p className="text-gray-700">{description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center">
          <a href="/roster" className="text-pink-600 underline hover:text-pink-800">Explore the Full Roster</a>
        </p>
      </section>

      {/* Vision Section */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">A Vision Worth Building Together</h2>
        <p className="text-gray-700">{vision.intro}</p>
        <blockquote className="text-xl font-semibold italic text-pink-600">"{vision.quote}"</blockquote>
        <p className="text-gray-700">{vision.support}</p>
      </section>

      {/* Scarcity Section */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">{scarcity.heading}</h2>
        {scarcity.paragraphs.map((text, idx) => (
          <p key={idx} className="text-gray-700">{text}</p>
        ))}
      </section>

      {/* How It Works Section */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-4">How It Works</h2>
        <ul className="space-y-6">
          {howItWorks.map(({ step, detail }) => (
            <li key={step}>
              <h3 className="text-xl font-medium">{step}</h3>
              <p className="text-gray-700">{detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-center text-gray-500">
          No crypto. No wallet. No complicated tech. Just a digital card, a private invite, and your spot at the table.
        </p>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-4">Frequently Asked Questions</h2>
        <ul className="space-y-6">
          {faq.map(({ q, a }) => (
            <li key={q}>
              <h3 className="font-medium">{q}</h3>
              <p className="text-gray-700">{a}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA Section */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">{finalCta.headline}</h2>
        <p className="text-gray-700">{finalCta.paragraph}</p>
        <CheckoutButton>
          {finalCta.button}
        </CheckoutButton>
        <p className="text-sm text-gray-500">{finalCta.note}</p>
      </section>
    </div>
  );
}
