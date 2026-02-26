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
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!cleaned || !cleaned.includes(".")) {
      setError("Please enter a valid domain (e.g. example.com)");
      return;
    }
    setError("");
    router.push(`/scan/personalize?domain=${encodeURIComponent(cleaned)}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 pt-16 pb-20"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      {/* Brand */}
      <div className="mb-10 text-center">
        <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
          AI Inclusion Checker
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-2xl w-full text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          Right now, your ideal customer is asking AI about businesses like yours.{" "}
          <span className="text-blue-400">Are you part of the answer?</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Run a free AI inclusion scan in under 60 seconds.
        </p>
      </div>

      {/* Input Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 w-full max-w-md"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
      >
        <label htmlFor="domain" className="block text-slate-700 font-medium mb-2 text-sm">
          Enter your website
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base mb-4"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-base cursor-pointer"
        >
          Run Scan →
        </button>
      </form>

      {/* Trust line */}
      <p className="mt-6 text-slate-400 text-sm text-center">
        AI systems now influence real buying decisions.
      </p>

      {/* Social proof */}
      <div className="mt-8 flex gap-6 text-slate-500 text-xs">
        <span>✓ Free scan</span>
        <span>✓ No credit card</span>
        <span>✓ Results in 60 sec</span>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mt-20 border-t border-white/10" />

      {/* How it works */}
      <section className="w-full max-w-md mt-14">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">How it works</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            From real customer questions to consistent discoverability — without ongoing work from your team.
          </p>
        </div>

        {/* Steps */}
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

        {/* Trust reinforcement */}
        <p className="mt-8 text-center text-slate-400 text-sm">
          No ongoing work required from your team. Full editorial control at all times.
        </p>
      </section>
    </main>
  );
}
