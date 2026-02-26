"use client";

import { useRef, useState } from "react";
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

const trustPoints = [
  "Built specifically for answer-based search environments",
  "Full editorial control — nothing published without approval",
  "No ongoing work required from your team",
];

const resultSignals = [
  { ok: true,  text: "Structured service pages" },
  { ok: false, text: "No answer-focused pages" },
  { ok: false, text: "No FAQ or question-based content" },
];

export default function LandingPage() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const checkerRef = useRef<HTMLFormElement>(null);

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

  const scrollToChecker = () => {
    checkerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => checkerRef.current?.querySelector("input")?.focus(), 400);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 pb-24"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      {/* ─── SECTION 1: HERO ─── */}
      <section
        id="hero"
        className="w-full max-w-[720px] flex flex-col items-center pt-10 sm:pt-16"
      >
        {/* 1. Logo */}
        <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
          Conpady
        </span>

        {/* 2. Headline */}
        <h1
          className="text-[34px] sm:text-[50px] font-extrabold text-white text-center leading-[1.1] max-w-[680px]"
          style={{ marginTop: "28px" }}
        >
          Is AI{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ignoring
          </span>{" "}
          your business?
        </h1>

        {/* 3. Subheadline */}
        <p
          className="text-base sm:text-lg text-slate-300 text-center"
          style={{ marginTop: "16px", opacity: 0.75 }}
        >
          Run a free scan and see if your site appears in AI answers.
        </p>

        {/* 4. Checker */}
        <form
          ref={checkerRef}
          onSubmit={handleSubmit}
          className="w-full"
          style={{ marginTop: "28px" }}
        >
          <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-3 w-full">
            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setError(""); }}
              placeholder="example.com"
              className="flex-1 px-4 text-white placeholder-slate-500 rounded-xl text-base transition-all focus:outline-none"
              style={{
                height: "56px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(4px)",
                boxShadow: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.60)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)")}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl transition-all whitespace-nowrap px-6 cursor-pointer disabled:opacity-60"
              style={{ height: "56px", minWidth: "160px" }}
            >
              {loading ? "Scanning…" : "Run Free Scan"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>

        {/* 5. Trust micro line */}
        <p
          className="text-[13px] text-center"
          style={{ marginTop: "12px", color: "rgba(148,163,184,0.55)" }}
        >
          Free scan · No signup · Results in seconds
        </p>
      </section>

      {/* ─── SECTION 2: RESULT PREVIEW ─── */}
      <section
        className="w-full max-w-[620px] flex flex-col items-center"
        style={{ marginTop: "80px" }}
      >
        <h2 className="text-base font-semibold text-slate-400 text-center uppercase tracking-widest mb-6">
          Example scan result
        </h2>

        {/* Result card */}
        <div
          className="w-full rounded-2xl px-6 py-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Website</span>
            <span className="text-white font-medium">example.com</span>
          </div>

          <div className="flex flex-col gap-1 mb-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider">AI inclusion status</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#f59e0b" }}
            >
              Limited visibility
            </span>
          </div>

          <div className="mb-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Detected signals</span>
            <ul className="mt-2 flex flex-col gap-[6px]">
              {resultSignals.map((s) => (
                <li key={s.text} className="flex items-center gap-2 text-sm">
                  <span
                    className="flex-shrink-0 font-bold"
                    style={{ color: s.ok ? "#34d399" : "#f87171" }}
                  >
                    {s.ok ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-300">{s.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl px-4 py-3"
            style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.20)" }}
          >
            <span className="text-slate-400 text-xs uppercase tracking-wider">Opportunity</span>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Your site is missing pages that help AI engines understand and recommend your services.
            </p>
          </div>
        </div>

        {/* Preview CTA */}
        <button
          onClick={scrollToChecker}
          className="mt-6 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium cursor-pointer"
        >
          Run your free scan →
        </button>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─── */}
      <section
        className="w-full max-w-[520px]"
        style={{ marginTop: "80px" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">How it works</h2>
          <p className="text-slate-400 text-sm leading-relaxed" style={{ opacity: 0.75 }}>
            From real customer questions to consistent discoverability — without ongoing work from your team.
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {steps.map((step) => (
            <li key={step.num}>
              <div
                className="rounded-xl px-5 py-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center"
                  >
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── SECTION 4: TRUST ─── */}
      <section
        className="w-full max-w-[520px]"
        style={{ marginTop: "80px" }}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Why companies trust Conpady
        </h2>

        <ul className="flex flex-col gap-4">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.30)" }}
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── SECTION 5: PRICING FRAMING ─── */}
      <section
        className="w-full max-w-[520px]"
        style={{ marginTop: "80px" }}
      >
        <div
          className="rounded-2xl px-6 py-7"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold text-white leading-snug mb-4">
            Until recently, appearing in AI answers required expensive SEO work
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            Companies often spend $3,000+ per month on SEO agencies and content production
            to improve discoverability. Conpady makes this process simple and accessible —
            starting at $99 per month.
          </p>

          <p
            className="text-sm"
            style={{ color: "rgba(148,163,184,0.60)" }}
          >
            No contracts. No ongoing operational work required.
          </p>
        </div>
      </section>
    </main>
  );
}
