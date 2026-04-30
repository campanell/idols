import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckoutButton from "./StripeCheckout";

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="h-6 w-fit px-3 text-sm">
            Checkout canceled
          </Badge>
          <CardTitle className="text-xl text-black sm:text-2xl">
            Your payment was not completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700 sm:text-base">
          <p>
            No charge was completed. This can happen if checkout was canceled,
            interrupted, or rejected by the card issuer.
          </p>
          <p>
            If you need help, contact{" "}
            <a
              href="mailto:service@idols4life.com"
              className="underline hover:text-indigo-700"
            >
              service@idols4life.com
            </a>
            . You can also return home and try again later.
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <CheckoutButton className="w-full justify-center sm:w-auto">
              Try Checkout Again
            </CheckoutButton>
            <Button asChild variant="outline" className="sm:w-auto">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}