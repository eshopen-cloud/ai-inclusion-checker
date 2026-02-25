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

  const steps = [
    { step: "fetching", status: record.status !== "queued" ? "complete" : "running" },
    {
      step: "analysis",
      status:
        record.status === "complete" || record.status === "failed"
          ? "complete"
          : record.status === "running"
          ? "running"
          : "pending",
    },
    {
      step: "scoring",
      status: record.status === "complete" ? "complete" : "pending",
    },
  ];

  return NextResponse.json({
    request_id: record.request_id,
    status: record.status,
    error: record.error,
    progress: steps,
    estimated_remaining_seconds: record.status === "complete" ? 0 : 5,
  });
}
