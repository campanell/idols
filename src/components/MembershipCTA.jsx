import CheckoutButton from "@/pages/StripeCheckout";
import membershipCtaVariants from "@/data/membershipCtaVariants.json";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant(seed, language = "en") {
  const languageMatches = membershipCtaVariants.filter(
    (variant) => variant.language === language
  );
  const variants = languageMatches.length
    ? languageMatches
    : membershipCtaVariants.filter((variant) => variant.language === "en");

  if (variants.length === 0) {
    return null;
  }

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
