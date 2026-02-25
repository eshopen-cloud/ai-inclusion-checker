"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
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
    </main>
  );
}
