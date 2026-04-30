import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="h-6 w-fit px-3 text-sm">
            Payment received
          </Badge>
          <CardTitle className="text-xl text-black sm:text-2xl">
            Welcome to Founders Circle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700 sm:text-base">
          <p>
            Your checkout is complete. Thank you for backing the vision and
            helping shape the future of virtual idols.
          </p>
          <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="font-medium text-gray-900">What happens next</p>
            <p>
              1) Check your email for your membership confirmation and card
              details.
            </p>
            <p>2) Use the community invite in that message when ready.</p>
            <p>
              3) Need help? Reply to that email or contact{" "}
              <a
                href="mailto:service@idols4life.com"
                className="underline hover:text-indigo-700"
              >
                service@idols4life.com
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Button asChild className="sm:w-auto">
              <Link to="/">Return to Home</Link>
            </Button>
            <Button asChild variant="outline" className="sm:w-auto">
              <Link to="/roster">View Roster</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}