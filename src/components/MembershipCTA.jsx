import CheckoutButton from "@/pages/StripeCheckout";
import membershipCtaVariants from "@/data/membershipCtaVariants.json";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Purpose:
 * Renders the compact membership call-to-action rail used on video cards.
 *
 * Important functions:
 * - hashString(value):
 *   Produces a deterministic numeric hash from a string seed.
 * - pickVariant(seed, language):
 *   Selects a CTA variant by language with English fallback, then uses
 *   deterministic hashing to keep variant selection stable per card.
 * - MembershipCTA({ videoId, language }):
 *   Resolves the CTA variant for the current card and renders headline,
 *   bullets, and Checkout button with variant attribution metadata.
 */

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant(seed, language = "en") {
  // Prefer language-specific variants, but always fall back to English to avoid empty CTAs.
  const languageMatches = membershipCtaVariants.filter(
    (variant) => variant.language === language
  );
  const variants = languageMatches.length
    ? languageMatches
    : membershipCtaVariants.filter((variant) => variant.language === "en");

  if (variants.length === 0) {
    return null;
  }

  // Deterministic selection prevents CTA jitter across re-renders for the same card.
  const variantIndex = hashString(seed) % variants.length;
  return variants[variantIndex];
}

export default function MembershipCTA({ videoId, language = "en" }) {
  const variant = pickVariant(videoId ?? "default", language);

  if (!variant) {
    return null;
  }

  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle className="text-balance">{variant.headline}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          {variant.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 pt-0">
        <CheckoutButton className="w-full justify-center" ctaVariantId={variant.id}>
          {variant.buttonText}
        </CheckoutButton>
      </CardFooter>
    </Card>
  );
}
