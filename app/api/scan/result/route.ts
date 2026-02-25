import { NextRequest, NextResponse } from "next/server";
import { getRecord } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scanToken = searchParams.get("scan_token");

  if (!scanToken) {
    return NextResponse.json({ error: "scan_token is required" }, { status: 400 });
  }

  const record = getRecord(scanToken);
  if (!record) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (record.status === "failed") {
    return NextResponse.json({ error: record.error || "Scan failed" }, { status: 422 });
  }

  if (record.status !== "complete") {
    return NextResponse.json({ error: "Scan not complete yet", status: record.status }, { status: 202 });
  }

  // Return clean public result (no internal analysis blobs)
  return NextResponse.json({
    request_id: record.request_id,
    status: "complete",
    domain: record.domain,
    category: record.category,
    persona: record.persona,
    readiness_score: record.readiness_score,
    status_label: record.status_label,
    confidence: record.confidence,
    example_query: record.example_query,
    queries: record.queries,
    structural_gaps: record.structural_gaps,
  });
}
