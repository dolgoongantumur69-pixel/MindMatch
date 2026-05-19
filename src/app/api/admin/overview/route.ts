import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      usersCount, jobsCount, applicationsCount,
      roleCounts, recentUsers, recentJobs, recentApplications,
      viewsToday, viewsWeek, viewsMonth,
      uniqueVisitorsToday, uniqueVisitorsWeek,
      topPages, rawDailyViews, newUsersRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true, title: true, location: true, isActive: true, createdAt: true,
          employer: { select: { name: true, profile: { select: { companyName: true } } } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, status: true, createdAt: true,
          user: { select: { email: true, name: true } },
          job: { select: { id: true, title: true } },
        },
      }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }).then((r) => r.length),
      prisma.pageView.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }).then((r) => r.length),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: weekAgo } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Build last-7-days date keys
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10));
    }

    const dailyViewMap: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const row of rawDailyViews) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (key in dailyViewMap) dailyViewMap[key]++;
    }

    const dailyUserMap: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
    for (const row of newUsersRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (key in dailyUserMap) dailyUserMap[key]++;
    }

    return NextResponse.json({
      metrics: { usersCount, jobsCount, applicationsCount },
      analytics: {
        viewsToday,
        viewsWeek,
        viewsMonth,
        uniqueVisitorsToday,
        uniqueVisitorsWeek,
        topPages: topPages.map((p) => ({ path: p.path, count: p._count.path })),
        dailyViews: days.map((date) => ({ date, count: dailyViewMap[date] })),
        dailyNewUsers: days.map((date) => ({ date, count: dailyUserMap[date] })),
      },
      roleCounts,
      recentUsers,
      recentJobs,
      recentApplications,
    });
  } catch (error) {
    console.error("admin overview error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
