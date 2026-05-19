import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard");
  }

  return (
    <div
      className="fixed flex"
      style={{ background: "#070B14", top: "64px", left: 0, right: 0, bottom: 0, zIndex: 10 }}
    >
      {/* Sidebar */}
      <div className="shrink-0 h-full overflow-y-auto">
        <AdminSidebar email={session.user.email ?? ""} name={session.user.name ?? ""} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-7 py-7 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
