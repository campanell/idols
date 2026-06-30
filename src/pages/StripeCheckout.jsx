import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getOppref,
  measureCheckoutStarted,
} from '@/lib/openaiMeasurement';

/**
 * Purpose:
 * Provides the reusable checkout button used across pages/components to
 * start Stripe Checkout through the `/api/stripe` endpoint.
 *
 * Important functions:
 * - handleCheckout():
 *   Sends optional CTA attribution metadata to the backend, receives the
 *   hosted Checkout URL, and redirects the browser to Stripe Checkout.
 * - CheckoutButton(props):
 *   UI wrapper around the button with loading state and shared styling.
 */

const CheckoutButton = ({ children, className, ctaVariantId, ...props }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      measureCheckoutStarted({ ctaVariantId });

      const oppref = getOppref();

      // Send CTA variant ID context so backend can persist conversion attribution metadata.  ID is used to track the conversion message from data/membershipCtaVariants.json
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cta_variant_id: ctaVariantId ?? null,
          oppref,
        }),
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : `Checkout could not start (${response.status}).`;
        setError(msg);
        return;
      }

      if (!data.url || typeof data.url !== 'string') {
        setError('Checkout did not return a payment link. Check Stripe and server configuration.');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err instanceof Error ? err.message : 'Something went wrong starting checkout.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className={cn(
          'bg-[#DB0011] text-white hover:bg-[#b8000e]',
          className
        )}
        {...props}
      >
        {loading ? 'Processing...' : children}
      </Button>
      {error ? (
        <p className="text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default CheckoutButton;