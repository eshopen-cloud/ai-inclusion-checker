import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runScanSync } from "@/lib/scanOrchestrator";
import { ScanRequest } from "@/lib/types";

// Allow up to 60s on Vercel Pro; hobby tier caps at 10s
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, scope, city, audience, session_id } = body;

    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }
    if (!["local", "national"].includes(scope)) {
      return NextResponse.json({ error: "scope must be local or national" }, { status: 400 });
    }
    if (!["consumers", "businesses", "niche"].includes(audience)) {
      return NextResponse.json({ error: "invalid audience" }, { status: 400 });
    }

    const requestId = randomUUID();
    const scanToken = randomUUID();

    const scanReq: ScanRequest = {
      domain: domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      scope,
      city: city || undefined,
      audience,
      session_id: session_id || randomUUID(),
    };

    const result = await runScanSync(requestId, scanToken, scanReq);

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[API] /scan/request error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
