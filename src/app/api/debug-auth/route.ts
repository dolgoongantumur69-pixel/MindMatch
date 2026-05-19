import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID:     process.env.GOOGLE_CLIENT_ID     ? "✅ set" : "❌ missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ set" : "❌ missing",
    NEXTAUTH_URL:         process.env.NEXTAUTH_URL          ?? "❌ missing",
    NEXTAUTH_SECRET:      process.env.NEXTAUTH_SECRET       ? "✅ set" : "❌ missing",
  });
}
