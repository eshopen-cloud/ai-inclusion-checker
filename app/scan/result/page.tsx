"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ─── Copy strings ────────────────────────────────────────────────────────────
const COPY = {
  // A) Status card
  statusHeadline: "Right now, AI has nothing to quote when buyers ask about solutions like yours.",
  statusSub: "We modeled 5 buyer queries and checked your site for citable coverage.",
  scoreLabel: "Inclusion Readiness",

  // B) What happens when buyers ask AI
  buyerSectionTitle: "What happens when buyers ask AI",
  buyerSectionBody:
    "AI assistants answer buyer questions by citing a handful of structured sources. If your site doesn't have the right pages, you simply don't appear — even if you're the best option in your category.",
  sourceTypes: [
    { icon: "≡", label: "Category comparison pages" },
    { icon: "?", label: "Structured FAQ / Q&A pages" },
    { icon: "✦", label: "Dedicated solution pages" },
  ],

  // C) Blocking section
  blockingTitle: "What's blocking AI from citing your site",

  // D) Buyer questions
  queryTitle: "Buyer questions your site can't answer yet",
  querySub:
    "These are decision-stage queries buyers ask. We looked for pages on your site that could be cited for each.",
  queryNotFound: "No answer page found",
  queryFound: "Answer page found",

  // E) What we'll deploy first
  deployTitle: "What we'll deploy first",
  deployBody:
    "We will create and publish your first 5 decision-stage answer posts designed to maximize AI visibility.",
  deployBullets: [
    "Answer the exact questions buyers ask when choosing solutions like yours",
    "Position your business as a relevant source in your category",
    "Publish directly to your site (WordPress or compatible CMS)",
  ],

  // F) After trial
  afterTrialTitle: "What happens after you start the trial",
  afterTrialSteps: [
    {
      num: "1",
      text: "We generate your AI Brand Kit (positioning, persona, services, writing style). You approve or edit.",
    },
    {
      num: "2",
      text: "We identify 10 high-impact buyer questions. You pick the first 5 and give a 40–50 word corridor answer for each.",
    },
    {
      num: "3",
      text: "We publish structured posts directly to your site.",
    },
  ],

  // G) First week outcome
  outcomeTitle: "Your first week outcome",
  outcomeBullets: [
    "5 structured answer posts live on your site",
    "Clear category positioning AI can understand",
    "Coverage for high-impact buyer questions",
  ],
  outcomeClosing: "This makes your site eligible to be cited in AI answers.",

  // H) CTA
  ctaButton: "Start free 7-day trial",
  ctaPricing: "$0 today. $99/month after 7 days. Cancel anytime.",
  ctaSelfServe: "Self-serve. No agency. No calls.",
  ctaSecondary: "Fix my AI inclusion →",

  // Misc
  tensionLine:
    "If nothing changes, AI will continue to skip your site when buyers search for solutions like yours.",
  rescan: "Scan a different domain",
};
// ─────────────────────────────────────────────────────────────────────────────

interface ScanResult {
  request_id: string;
  domain: string;
  category: string;
  persona: { title: string; goal: string; pain_points: string[] };
  readiness_score: number;
  status_label: string;
  confidence: "High" | "Medium" | "Low";
  example_query: string;
  queries: Array<{ id: string; text: string; supported: boolean }>;
  structural_gaps: string[];
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  // Color: only red below 40, amber 40-69, green 70+
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";
  // Thicker stroke, darker background ring
  const strokeWidth = 13;
  const bgRingColor = "#c7d2dc"; // noticeably darker than before

  return (
    <div className="flex flex-col items-center">
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} fill="none" stroke={bgRingColor} strokeWidth={strokeWidth} />
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 1.5s ease-in-out",
          }}
        />
        <text x="68" y="63" textAnchor="middle" fontSize="30" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="68" y="83" textAnchor="middle" fontSize="11" fill="#64748b">
          / 100
        </text>
      </svg>
      <p className="text-xs text-slate-500 mt-1 font-medium">{COPY.scoreLabel}</p>
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 ${className}`}
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {children}
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scanToken = searchParams.get("scan_token") || "";
  const ctaRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    if (!scanToken) {
      setError("No scan token found.");
      setLoading(false);
      return;
    }
    try {
      const stored = sessionStorage.getItem(`scan_result_${scanToken}`);
      if (stored) {
        setResult(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch {
      // sessionStorage unavailable
    }
    setError("Result not found. Please run a new scan.");
    setLoading(false);
  }, [scanToken]);

  // Show sticky CTA after user scrolls past the status card
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 340);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCta = () => {
    ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ef" }}>
        <div className="text-slate-500">Loading your results…</div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f5f3ef" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-600 mb-4">{error || "No result found."}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer"
          >
            Start Over
          </button>
        </div>
      </main>
    );
  }

  const score = result.readiness_score;
  const isLow = score < 40;

  return (
    // Warm off-white background instead of cold slate
    <main className="min-h-screen py-10 px-4 pb-28" style={{ background: "#f5f3ef" }}>
      <div className="max-w-xl mx-auto space-y-5">

        {/* Brand label */}
        <div className="text-center">
          <span className="text-blue-600 font-semibold text-xs tracking-widest uppercase">
            AI Inclusion Checker
          </span>
          <p className="text-slate-400 text-xs font-mono mt-0.5">{result.domain}</p>
        </div>

        {/* ── A) STATUS CARD ─────────────────────────────────────────── */}
        <SectionCard>
          <h1 className="text-lg font-bold text-slate-900 leading-snug mb-1">
            {COPY.statusHeadline}
          </h1>
          <p className="text-sm text-slate-500 mb-5">{COPY.statusSub}</p>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <ScoreGauge score={score} />
            <div className="flex-1 text-center sm:text-left space-y-2">
              {/* Status label — red only when truly low */}
              <p
                className={`text-sm font-semibold ${
                  isLow ? "text-red-600" : score < 70 ? "text-amber-700" : "text-green-700"
                }`}
              >
                {result.status_label}
              </p>
              <p className="text-xs text-slate-500">Category: {result.category}</p>
              {/* Secondary CTA anchored near top */}
              <button
                onClick={scrollToCta}
                className="mt-2 text-sm font-semibold text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-800"
              >
                {COPY.ctaSecondary}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── B) WHAT HAPPENS WHEN BUYERS ASK AI ─────────────────────── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-800 mb-2">{COPY.buyerSectionTitle}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{COPY.buyerSectionBody}</p>
          <div className="flex flex-col gap-2">
            {COPY.sourceTypes.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5">
                <span className="text-slate-400 font-bold text-base w-5 flex-shrink-0">{s.icon}</span>
                <span className="text-sm text-slate-700">{s.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── C) WHAT'S BLOCKING AI ───────────────────────────────────── */}
        {result.structural_gaps.length > 0 && (
          <SectionCard>
            <h2 className="text-base font-bold text-slate-800 mb-4">{COPY.blockingTitle}</h2>
            <ul className="space-y-3">
              {result.structural_gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  {/* Amber indicator — not red */}
                  <span className="mt-0.5 flex-shrink-0 text-amber-500 font-bold">–</span>
                  <span className="text-slate-700">{gap}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* ── D) BUYER QUESTIONS ──────────────────────────────────────── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-800 mb-1">{COPY.queryTitle}</h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">{COPY.querySub}</p>
          <div className="space-y-2">
            {result.queries.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0"
              >
                <p className="text-sm text-slate-700 flex-1">"{q.text}"</p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
                    q.supported
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {q.supported ? `✓ ${COPY.queryFound}` : COPY.queryNotFound}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── E) WHAT WE'LL DEPLOY FIRST ──────────────────────────────── */}
        <SectionCard className="border border-blue-100">
          <h2 className="text-base font-bold text-slate-800 mb-1">{COPY.deployTitle}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{COPY.deployBody}</p>
          <ul className="space-y-2.5">
            {COPY.deployBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* ── F) WHAT HAPPENS AFTER TRIAL ─────────────────────────────── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-800 mb-4">{COPY.afterTrialTitle}</h2>
          <ol className="space-y-4">
            {COPY.afterTrialSteps.map((step) => (
              <li key={step.num} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center"
                >
                  {step.num}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* ── G) FIRST WEEK OUTCOME ────────────────────────────────────── */}
        <SectionCard className="border border-green-100">
          <h2 className="text-base font-bold text-slate-800 mb-3">{COPY.outcomeTitle}</h2>
          <ul className="space-y-2.5 mb-4">
            {COPY.outcomeBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-green-600 mt-0.5 flex-shrink-0 font-bold">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600 italic">{COPY.outcomeClosing}</p>
        </SectionCard>

        {/* Tension line — lighter treatment, not heavier than CTA */}
        {isLow && (
          <div
            className="rounded-xl px-5 py-4 text-center text-sm text-slate-500 border border-slate-200"
            style={{ background: "#f0ede8" }}
          >
            {COPY.tensionLine}
          </div>
        )}

        {/* ── H) CTA BLOCK ─────────────────────────────────────────────── */}
        <div
          ref={ctaRef}
          className="rounded-2xl px-8 py-10 text-center"
          style={{ background: "#1d4ed8", boxShadow: "0 6px 32px rgba(29,78,216,0.35)" }}
        >
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">
            7-Day Free Trial
          </p>
          <h2 className="text-2xl font-extrabold text-white leading-snug mb-2">
            Make your site citable by AI
          </h2>
          <p className="text-blue-200 text-sm mb-7 leading-relaxed">
            {COPY.ctaSelfServe}
          </p>
          <button
            onClick={() => router.push(`/trial?scan_token=${scanToken}`)}
            className="w-full max-w-xs mx-auto block bg-white text-blue-700 font-extrabold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors text-base cursor-pointer"
            style={{ boxShadow: "0 2px 12px rgba(255,255,255,0.3)" }}
          >
            {COPY.ctaButton}
          </button>
          <p className="text-blue-300 text-sm mt-4 font-medium">{COPY.ctaPricing}</p>
        </div>

        {/* Re-scan link */}
        <div className="text-center pb-4">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 text-sm hover:text-slate-600 cursor-pointer underline"
          >
            {COPY.rescan}
          </button>
        </div>
      </div>

      {/* ── Sticky bottom CTA (mobile) ──────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showStickyCta ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ background: "#1d4ed8", boxShadow: "0 -4px 20px rgba(29,78,216,0.3)" }}
      >
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-white text-xs font-medium leading-tight">
            $0 today · $99/mo after 7 days
          </p>
          <button
            onClick={() => router.push(`/trial?scan_token=${scanToken}`)}
            className="flex-shrink-0 bg-white text-blue-700 font-extrabold py-2.5 px-6 rounded-xl text-sm cursor-pointer hover:bg-blue-50 transition-colors"
          >
            {COPY.ctaButton}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#f5f3ef" }}
        />
      }
    >
      <ResultContent />
    </Suspense>
  );
}
