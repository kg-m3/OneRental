import React, { useMemo, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { supabase } from "../../lib/supabase"; // keep your path

type Props = {
  bookingId: string;
  email: string;
  /** Amount in ZAR cents. Example: R120.00 => 12000 */
  amountZarCents: number;
  /** Optional UX callback; final truth still comes from webhook */
  onProvisionalSuccess?: (reference: string) => void;
  className?: string;
  label?: string;
};

type InitResponse = {
  reference: string;
  authorization_url?: string;
  access_code?: string;
};

const PayNowButton: React.FC<Props> = ({
  bookingId,
  email,
  amountZarCents,
  onProvisionalSuccess,
  className,
  label = "Pay Now",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sanitize/normalize amount to an integer in cents
  const amountInt = useMemo(() => {
    const n = Number(amountZarCents);
    return Number.isFinite(n) ? Math.round(n) : NaN;
  }, [amountZarCents]);

  const canPay = useMemo(() => {
    return (
      typeof bookingId === "string" &&
      bookingId.trim().length > 0 &&
      typeof email === "string" &&
      email.includes("@") &&
      Number.isInteger(amountInt) &&
      amountInt > 0 &&
      !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    );
  }, [bookingId, email, amountInt]);

  const handleClick = async () => {
    setError(null);

    // Build payload & log it so we can verify what’s going to the server
    const payload = {
      bookingId: String(bookingId ?? ""),
      email: String(email ?? ""),
      amountZarCents: amountInt,
      metadata: { bookingId },
    };
    console.log("paystack-init payload →", payload);

    // Hard guards to stop bad requests early (and give clear UI errors)
    if (!payload.bookingId) return setError("bookingId is missing");
    if (!payload.email || !payload.email.includes("@")) return setError("Valid email is required");
    if (!Number.isInteger(payload.amountZarCents) || payload.amountZarCents <= 0) {
      return setError("amountZarCents must be a positive integer in cents");
    }
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      return setError("Missing VITE_PAYSTACK_PUBLIC_KEY");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<InitResponse>("paystack-init", {
        body: payload,
      });

      if (error) {
        // Surface the server’s message if present
        console.error("invoke error:", error, (error as any).context);
        const serverMsg =
          (error as any).context?.error ||
          (error as any).context?.detail ||
          error.message;
        throw new Error(serverMsg || "Could not start payment");
      }

      const reference = data?.reference;
      if (!reference) throw new Error("No payment reference returned");

      const popup = new PaystackPop();
      popup.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
        reference,
        amount: payload.amountZarCents,
        currency: "ZAR",
        email: payload.email,
        onSuccess: (trx: { reference: string }) => {
          onProvisionalSuccess?.(trx.reference);
        },
        onCancel: () => {
          // user closed the popup
        },
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Could not start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !canPay}
        // aria-busy={loading}
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium shadow-sm border transition ${
          loading || !canPay ? "opacity-60 cursor-not-allowed" : "hover:shadow"
        }`}
      >
        {loading ? "Starting…" : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PayNowButton;
