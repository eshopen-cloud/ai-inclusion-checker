"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PersonalizeForm() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain") || "";
  const router = useRouter();

  const [scope, setScope] = useState<"local" | "national" | null>(null);
  const [city, setCity] = useState("");
  const [audience, setAudience] = useState<"consumers" | "businesses" | "niche" | null>(null);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!scope) { setError("Please select where you compete."); return; }
    if (scope === "local" && !city.trim()) { setError("Please enter your city."); return; }
    if (!audience) { setError("Please select your primary audience."); return; }
    setError("");

    const params = new URLSearchParams({
      domain,
      scope,
      audience,
      ...(scope === "local" && city ? { city } : {}),
    });
    router.push(`/scan/loading?${params.toString()}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">
            AI Inclusion Checker
          </span>
          <h1 className="text-3xl font-bold text-white mt-3">
            Help us refine your AI visibility scan
          </h1>
          {domain && (
            <p className="text-slate-400 mt-2 text-sm">
              Scanning: <span className="text-blue-300 font-mono">{domain}</span>
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          {/* Q1 */}
          <div className="mb-8">
            <p className="text-slate-800 font-semibold mb-4 text-base">
              Where do you compete?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setScope("local"); setError(""); }}
                className={`py-4 px-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${
                  scope === "local"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                📍 Local market
              </button>
              <button
                onClick={() => { setScope("national"); setCity(""); setError(""); }}
                className={`py-4 px-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${
                  scope === "national"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                🌐 National / Online
              </button>
            </div>

            {/* City input */}
            {scope === "local" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city (e.g. Austin, TX)"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Q2 */}
          <div className="mb-8">
            <p className="text-slate-800 font-semibold mb-4 text-base">
              Who is your primary audience?
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "consumers" as const, label: "🧑‍💼 Consumers" },
                { value: "businesses" as const, label: "🏢 Businesses" },
                { value: "niche" as const, label: "🎯 Niche / Specialized" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setAudience(opt.value); setError(""); }}
                  className={`py-4 px-2 rounded-xl border-2 font-medium text-xs transition-all cursor-pointer text-center ${
                    audience === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-base cursor-pointer"
          >
            Continue Scan →
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PersonalizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }} />}>
      <PersonalizeForm />
    </Suspense>
  );
}
