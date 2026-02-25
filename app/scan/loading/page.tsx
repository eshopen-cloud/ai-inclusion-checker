"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const STEPS = [
  { id: "identify", label: "Identifying your category" },
  { id: "mapping", label: "Mapping high-intent AI queries" },
  { id: "sampling", label: "Sampling AI recommendation responses" },
  { id: "citation", label: "Checking citation signals" },
  { id: "readiness", label: "Evaluating inclusion readiness" },
];

function LoadingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = searchParams.get("domain") || "";
  const scope = searchParams.get("scope") || "national";
  const city = searchParams.get("city") || "";
  const audience = searchParams.get("audience") || "businesses";

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Step animation (runs independently)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 2200);
    return () => clearInterval(stepInterval);
  }, []);

  // Progress bar animation — stops at 90% until scan completes
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + 1.5;
      });
    }, 300);
    return () => clearInterval(progressInterval);
  }, []);

  // Run scan — single request, waits for full result
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const runScan = async () => {
      try {
        const res = await fetch("/api/scan/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            scope,
            city,
            audience,
            session_id: crypto.randomUUID(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Scan failed");
        }

        // Store full result in sessionStorage so result page can read it
        sessionStorage.setItem(`scan_result_${data.scan_token}`, JSON.stringify(data));

        setProgress(100);
        setCurrentStep(STEPS.length - 1);

        setTimeout(() => {
          router.push(`/scan/result?scan_token=${data.scan_token}`);
        }, 600);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete scan");
      }
    };

    runScan();
  }, [domain, scope, city, audience, router]);

  if (error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Scan Error</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
            AI Inclusion Checker
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
          {/* Animated icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                style={{ animation: "spin 1s linear infinite" }}
              ></div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Analyzing your AI visibility…
          </h1>
          {domain && (
            <p className="text-slate-400 text-sm mb-6 font-mono">{domain}</p>
          )}

          {/* Progress bar */}
          <div className="bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-3 text-left">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isDone
                        ? "text-green-600 font-medium"
                        : isActive
                        ? "text-blue-700 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-slate-500 text-xs text-center">
          This may take up to 30 seconds. AI-driven discovery is already influencing buying decisions.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#0f172a" }} />}>
      <LoadingContent />
    </Suspense>
  );
}
