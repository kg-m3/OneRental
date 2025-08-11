// supabase/functions/paystack-init/index.ts
// @ts-nocheck
// Deno Edge Function: initialize a Paystack transaction.
// Expects: { bookingId, email, amountZarCents, metadata }
// Returns: { reference, authorization_url?, access_code? }

// Using @ts-nocheck to skip TypeScript checking for this file
// as it's meant to run in Deno environment which has different globals than Node.js

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

type InitBody = {
  bookingId: string;
  email: string;
  amountZarCents: number;
  metadata?: Record<string, unknown>;
};

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders(origin) });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing PAYSTACK_SECRET_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const body = (await req.json()) as InitBody;
    if (!body.bookingId || !body.email || !body.amountZarCents) {
      return new Response(JSON.stringify({ error: "bookingId, email and amountZarCents are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Create a unique reference you can later map back to bookingId
    const reference = `onerental-${body.bookingId}-${crypto.randomUUID()}`;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        amount: body.amountZarCents, // cents
        currency: "ZAR",
        reference,
        metadata: { ...body.metadata, bookingId: body.bookingId },
      }),
    });

    const initData = await initRes.json();
    if (!initRes.ok) {
      return new Response(JSON.stringify(initData), {
        status: initRes.status,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // TODO: Persist the reference against the booking (optional here; do this in webhook too)
    // You can call Supabase from Edge Functions using Service Role if desired.

    return new Response(
      JSON.stringify({
        reference,
        authorization_url: initData?.data?.authorization_url,
        access_code: initData?.data?.access_code,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
});
