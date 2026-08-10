import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 16_000;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  try {
    const event = JSON.parse(raw);
    console.error(JSON.stringify({ service: "life-os", receivedAt: new Date().toISOString(), ...event }));
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
