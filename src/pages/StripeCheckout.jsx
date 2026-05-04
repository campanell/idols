import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Send CTA variant ID context so backend can persist conversion attribution metadata.  ID is used to track the conversion message from data/membershipCtaVariants.json
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cta_variant_id: ctaVariantId ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default CheckoutButton;