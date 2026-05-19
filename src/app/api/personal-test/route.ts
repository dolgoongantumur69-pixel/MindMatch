import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Only the authenticated user can access their own result — no admin override.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });

  try {
    const result = await prisma.personalTestResult.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json(result ?? null);
  } catch {
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });

  try {
    const { mbtiType, iqScore, iqTotal, eqScore, eqMax } = await req.json();

    const result = await prisma.personalTestResult.upsert({
      where: { userId: session.user.id },
      update: { mbtiType, iqScore, iqTotal, eqScore, eqMax },
      create: { userId: session.user.id, mbtiType, iqScore, iqTotal, eqScore, eqMax },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
