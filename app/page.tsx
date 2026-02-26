"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    num: 1,
    title: "Identify real buyer questions",
    body: "We find the actual questions your potential customers ask across search engines, forums, and communities when researching services like yours.",
  },
  {
    num: 2,
    title: "Prioritize high-intent opportunities",
    body: "We focus on questions asked by people actively evaluating providers, not general informational queries.",
  },
  {
    num: 3,
    title: "Generate ready-to-publish pages",
    body: "Structured answer pages tailored specifically to your services.",
  },
  {
    num: 4,
    title: "Delivered directly to your site — with full control",
    body: "Pages appear as drafts for approval, or publish automatically — based on your preference.",
  },
  {
    num: 5,
    title: "Gain ongoing discoverability",
    body: "Your company becomes visible when potential customers search and compare providers.",
  },
];

export default function LandingPage() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      setError("Please enter a valid domain (e.g. example.com)");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/scan/personalize?domain=${encodeURIComponent(cleaned)}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 pb-20"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      {/* Hero */}
      <section className="w-full max-w-[720px] flex flex-col items-center pt-10 sm:pt-16">

        {/* 1. Logo */}
        <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
          AI Inclusion Checker
        </span>

        {/* 2. Headline — 80px below logo */}
        <h1
          className="text-[36px] sm:text-5xl font-extrabold text-white text-center"
          style={{ marginTop: "80px", lineHeight: 1.1 }}
        >
          Does your business appear in AI answers when customers search?
        </h1>

        {/* 3. Subheadline — 16px below headline */}
        <p
          className="text-base sm:text-lg text-slate-300 text-center"
          style={{ marginTop: "16px", opacity: 0.75 }}
        >
          Run a free scan and see if your site appears in AI answers.
        </p>

        {/* 4. Checker — 28px below subheadline */}
        <form onSubmit={handleSubmit} className="w-full" style={{ marginTop: "28px" }}>
          <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-3 w-full">
            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setError(""); }}
              placeholder="example.com"
              className="flex-1 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-base"
              style={{
                height: "54px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(4px)",
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl transition-all whitespace-nowrap px-6 cursor-pointer disabled:opacity-60"
              style={{ height: "54px" }}
            >
              {loading ? "Scanning…" : "Run Free Scan"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>

        {/* 5. Trust line — 12px below checker */}
        <p
          className="text-[13px] text-center"
          style={{ marginTop: "12px", color: "rgba(148,163,184,0.6)" }}
        >
          Free scan · No signup · Results in seconds
        </p>
      </section>

      {/* Divider */}
      <div className="w-full max-w-[720px] mt-20 border-t border-white/10" />

      {/* How it works */}
      <section className="w-full max-w-md mt-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">How it works</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            From real customer questions to consistent discoverability — without ongoing work from your team.
          </p>
        </div>

        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.num}>
              <div
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-slate-400 text-sm">
          No ongoing work required from your team. Full editorial control at all times.
        </p>
      </section>
    </main>
  );
}
