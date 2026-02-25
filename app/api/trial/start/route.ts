import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getRecord } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scan_token, user } = body;

    if (!user?.email || !scan_token) {
      return NextResponse.json({ error: "email and scan_token are required" }, { status: 400 });
    }

    const record = getRecord(scan_token);
    if (!record) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // In production: create Stripe/PayPal subscription here
    // For MVP: return mock trial response
    const trialId = randomUUID();

    return NextResponse.json({
      trial_id: trialId,
      status: "active",
      billing_info: {
        plan: "starter",
        price_cents: 9900,
        trial_days: 7,
        currency: "USD",
      },
      domain: record.domain,
      email: user.email,
    });
  } catch (err) {
    console.error("[API] /trial/start error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
