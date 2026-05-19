import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = (await req.json()) as {
      path?: string;
      referrer?: string;
      sessionId?: string;
    };

    if (!path || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    await prisma.pageView.create({
      data: {
        path: path.slice(0, 500),
        referrer: referrer ? referrer.slice(0, 500) : null,
        sessionId,
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
