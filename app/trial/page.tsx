"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TrialContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scanToken = searchParams.get("scan_token") || "";

  const [email, setEmail] = useState("");
  const [paypalClicked, setPaypalClicked] = useState(false);
  const [error, setError] = useState("");

  const handlePayPal = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setPaypalClicked(true);
    // Simulate PayPal redirect (demo only)
    setTimeout(() => {
      alert("Demo mode: PayPal integration will be wired in production. Trial started for " + email);
      setPaypalClicked(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
            AI Inclusion Checker
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Start Getting Cited by AI — In the Next 7 Days
          </h1>
          <p className="text-slate-500 text-sm text-center mb-6">
            We'll build the structural foundation for AI citation readiness.
          </p>

          {/* What's included */}
          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-3">
              What happens during your trial
            </p>
            <ul className="space-y-3">
              {[
                { icon: "🔍", text: "Identify high-intent queries your customers are already asking AI" },
                { icon: "📄", text: "Generate structured decision-answer pages for your site" },
                { icon: "✍️", text: "Prepare drafts for publishing — ready to deploy" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 mb-6 text-center">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl font-bold text-blue-700">$0</span>
              <span className="text-slate-500 text-sm">today</span>
            </div>
            <p className="text-slate-600 text-sm">
              Then <strong>$99/month</strong> after 7 days. Cancel anytime.
            </p>
          </div>

          {/* Email input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* PayPal button */}
          <button
            onClick={handlePayPal}
            disabled={paypalClicked}
            className="w-full flex items-center justify-center gap-3 bg-[#FFC439] hover:bg-[#f0b428] text-[#003087] font-bold py-3.5 rounded-lg transition-colors text-base cursor-pointer disabled:opacity-70"
          >
            {paypalClicked ? (
              <span>Connecting to PayPal…</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.47z" />
                </svg>
                <span>Start My 7-Day Free Trial</span>
              </>
            )}
          </button>

          <p className="text-slate-400 text-xs text-center mt-3">
            Secure checkout via PayPal. No charge for 7 days.
          </p>
        </div>

        {/* Guarantees */}
        <div className="mt-6 flex justify-center gap-6 text-slate-400 text-xs">
          <span>✓ Cancel anytime</span>
          <span>✓ No long-term contract</span>
          <span>✓ Self-serve</span>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className="text-slate-400 text-sm hover:text-slate-300 cursor-pointer underline"
          >
            ← Back to results
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TrialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#0f172a" }} />}>
      <TrialContent />
    </Suspense>
  );
}
