import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initializeScanRecord, runScan } from "@/lib/scanOrchestrator";
import { ScanRequest } from "@/lib/types";

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

    // Initialize record synchronously
    initializeScanRecord(scanToken, requestId, scanReq);

    // Run scan asynchronously (fire and forget)
    runScan(scanToken, requestId, scanReq).catch((err) => {
      console.error("[API] scan error:", err);
    });

    return NextResponse.json({
      request_id: requestId,
      scan_token: scanToken,
      status: "queued",
      estimated_time_seconds: 12,
    });
  } catch (err) {
    console.error("[API] /scan/request error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
