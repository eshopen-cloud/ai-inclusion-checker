"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface ScanResult {
  request_id: string;
  domain: string;
  category: string;
  persona: {
    title: string;
    goal: string;
    pain_points: string[];
  };
  readiness_score: number;
  status_label: string;
  confidence: "High" | "Medium" | "Low";
  example_query: string;
  queries: Array<{
    id: string;
    text: string;
    supported: boolean;
  }>;
  structural_gaps: string[];
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1.5s ease-in-out" }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="30" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="70" y="85" textAnchor="middle" fontSize="11" fill="#94a3b8">
          / 100
        </text>
      </svg>
      <p className="text-xs text-slate-500 mt-1">Inclusion Readiness</p>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scanToken = searchParams.get("scan_token") || "";

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanToken) {
      setError("No scan token found.");
      setLoading(false);
      return;
    }

    // Read result from sessionStorage (set by the loading page)
    try {
      const stored = sessionStorage.getItem(`scan_result_${scanToken}`);
      if (stored) {
        setResult(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch {
      // sessionStorage unavailable — fall through to error
    }

    setError("Result not found. Please run a new scan.");
    setLoading(false);
  }, [scanToken]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-slate-500">Loading your results…</div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-600 mb-4">{error || "No result found."}</p>
          <button onClick={() => router.push("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer">
            Start Over
          </button>
        </div>
      </main>
    );
  }

  const isGood = result.readiness_score > 70;
  const isMid = result.readiness_score >= 40 && result.readiness_score <= 70;

  const statusIcon = isGood ? "🟢" : isMid ? "🟡" : "❌";
  const statusColor = isGood ? "text-green-600 bg-green-50 border-green-200" : isMid ? "text-yellow-700 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";
  const confidenceColor = result.confidence === "High" ? "bg-green-100 text-green-700" : result.confidence === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600";

  return (
    <main className="min-h-screen py-10 px-4" style={{ background: "#f8fafc" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="text-center">
          <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">
            AI Inclusion Checker
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">AI Inclusion Status</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">{result.domain}</p>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={result.readiness_score} />
            <div className="flex-1 text-center sm:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold mb-3 ${statusColor}`}>
                {statusIcon} {result.status_label}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                We analyzed high-intent queries relevant to your category{result.example_query?.includes("in ") ? " and location" : ""}. Your site was{" "}
                {isGood ? "structurally prepared" : "not structurally prepared"} to be cited in those queries.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${confidenceColor}`}>
                  {result.confidence} confidence
                </span>
                <span className="text-xs text-slate-400">Category: {result.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Example query */}
        {result.example_query && (
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Example query analyzed</p>
            <p className="text-white font-mono text-sm">"{result.example_query}"</p>
          </div>
        )}

        {/* Why this matters */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <h2 className="text-base font-bold text-slate-800 mb-4">Why this matters</h2>
          <ul className="space-y-3">
            {[
              "AI systems typically recommend only a few businesses per query.",
              "If you're not cited, you may be excluded from buyer decisions.",
              "Some businesses in your category may already be included.",
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">⚡</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Structural gaps */}
        {result.structural_gaps.length > 0 && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
            <h2 className="text-base font-bold text-slate-800 mb-4">
              Structural Gaps Detected
            </h2>
            <ul className="space-y-3">
              {result.structural_gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                  <span className="text-slate-700">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Query coverage */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <h2 className="text-base font-bold text-slate-800 mb-4">Query Coverage (5 queries)</h2>
          <div className="space-y-3">
            {result.queries.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                <p className="text-sm text-slate-700 flex-1">"{q.text}"</p>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                    q.supported
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {q.supported ? "✓ Supported" : "✗ Not supported"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tension line */}
        {!isGood && (
          <div className="bg-slate-900 rounded-xl p-5 text-center">
            <p className="text-slate-300 text-sm">
              If nothing changes, AI will continue excluding your business from decision-stage visibility.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Start Getting Cited by AI</h2>
          <p className="text-blue-100 text-sm mb-6">7-Day Free Trial — Self-serve. No agency. Cancel anytime.</p>
          <button
            onClick={() => router.push(`/trial?scan_token=${scanToken}`)}
            className="bg-white text-blue-700 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors text-base cursor-pointer"
          >
            Start Getting Cited by AI — 7-Day Free Trial
          </button>
          <p className="text-blue-200 text-xs mt-4">$0 today. $99/month after 7 days. Cancel anytime.</p>
        </div>

        {/* Re-scan link */}
        <div className="text-center pb-8">
          <button onClick={() => router.push("/")} className="text-slate-400 text-sm hover:text-slate-600 cursor-pointer underline">
            Scan a different domain
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }} />}>
      <ResultContent />
    </Suspense>
  );
}
