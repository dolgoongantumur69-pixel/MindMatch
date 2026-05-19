"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "JOBSEEKER" | "EMPLOYER" | "ADMIN";

interface User {
  id: string; name: string | null; email: string; role: Role;
  createdAt: string; _count: { applications: number; jobs: number };
}
interface UsersData { users: User[]; total: number; page: number; totalPages: number }

const ROLE_LABEL: Record<Role, string> = { JOBSEEKER: "Ажил хайгч", EMPLOYER: "Байгууллага", ADMIN: "Админ" };
const ROLE_COLOR: Record<Role, string> = { JOBSEEKER: "#4B7BF5", EMPLOYER: "#22C55E", ADMIN: "#A855F7" };

const S = "#0F1624";
const B = "rgba(255,255,255,0.07)";

export default function AdminUsersPage() {
  const [data,          setData]          = useState<UsersData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState<Role | "">("");
  const [page,          setPage]          = useState(1);
  const [roleDrafts,    setRoleDrafts]    = useState<Record<string, Role>>({});
  const [saving,        setSaving]        = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error,         setError]         = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "15" });
    if (search)     p.set("search", search);
    if (roleFilter) p.set("role",   roleFilter);
    fetch(`/api/admin/users?${p}`)
      .then(async (r) => { if (!r.ok) throw new Error("Failed"); return r.json() as Promise<UsersData>; })
      .then((d) => { setData(d); setRoleDrafts(Object.fromEntries(d.users.map((u) => [u.id, u.role]))); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  async function saveRole(userId: string) {
    const role = roleDrafts[userId]; if (!role) return;
    setSaving(userId); setError("");
    try {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      if (!r.ok) { const p = (await r.json().catch(() => ({}))) as { error?: string }; throw new Error(p.error ?? "Failed"); }
      setData((prev) => prev ? { ...prev, users: prev.users.map((u) => u.id === userId ? { ...u, role } : u) } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(null); }
  }

  async function deleteUser(userId: string) {
    setDeleting(userId); setError("");
    try {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!r.ok) { const p = (await r.json().catch(() => ({}))) as { error?: string }; throw new Error(p.error ?? "Failed"); }
      setData((prev) => prev ? { ...prev, users: prev.users.filter((u) => u.id !== userId), total: prev.total - 1 } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setDeleting(null); setConfirmDelete(null); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(75,123,245,0.15)" }}>
          <i className="fa-solid fa-users text-base" style={{ color: "#4B7BF5" }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Хэрэглэгчид</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
            {data ? `Нийт ${data.total.toLocaleString()} хэрэглэгч` : "Платформын бүх хэрэглэгчид"}
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass text-sm absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#374151" }} />
          <input type="text" placeholder="Нэр эсвэл имэйлээр хайх..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none"
            style={{ background: S, border: `1px solid ${B}`, color: "#E5E7EB" }} />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as Role | ""); setPage(1); }}
          className="px-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ background: S, border: `1px solid ${B}`, color: "#E5E7EB" }}>
          <option value="">Бүх үүрэг</option>
          <option value="JOBSEEKER">Ажил хайгч</option>
          <option value="EMPLOYER">Байгууллага</option>
          <option value="ADMIN">Админ</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: S, border: `1px solid ${B}` }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${B}` }}>
                    {["Хэрэглэгч", "Үүрэг", "Идэвхжил", "Бүртгүүлсэн", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((user) => {
                    const draft   = roleDrafts[user.id] ?? user.role;
                    const changed = draft !== user.role;
                    const c       = ROLE_COLOR[draft] ?? "#6B7280";
                    return (
                      <tr key={user.id} className="transition-colors" style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: c + "25", color: c }}>
                              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{user.name ?? "—"}</p>
                              <p className="text-xs truncate" style={{ color: "#4B5563" }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <select value={draft} onChange={(e) => setRoleDrafts((p) => ({ ...p, [user.id]: e.target.value as Role }))}
                              className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                              style={{ background: c + "15", border: `1px solid ${c}40`, color: c }}>
                              <option value="JOBSEEKER">Ажил хайгч</option>
                              <option value="EMPLOYER">Байгууллага</option>
                              <option value="ADMIN">Админ</option>
                            </select>
                            {changed && (
                              <button onClick={() => saveRole(user.id)} disabled={saving === user.id}
                                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-80"
                                style={{ background: "#4B7BF5" }}>
                                {saving === user.id ? "..." : "Хадгал"}
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Activity */}
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#4B5563" }}>
                          {user._count.applications > 0 && <span className="mr-3">{user._count.applications} өргөдөл</span>}
                          {user._count.jobs > 0 && <span>{user._count.jobs} ажил</span>}
                          {user._count.applications === 0 && user._count.jobs === 0 && "—"}
                        </td>
                        {/* Date */}
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#374151" }}>
                          {new Date(user.createdAt).toLocaleDateString("mn-MN")}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          {confirmDelete === user.id ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => deleteUser(user.id)} disabled={deleting === user.id}
                                className="text-xs px-2.5 py-1.5 rounded-lg font-bold text-white disabled:opacity-50"
                                style={{ background: "#EF4444" }}>
                                {deleting === user.id ? "..." : "Устгах"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: "#4B5563" }}>
                                Цуцлах
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(user.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                              style={{ color: "#374151" }}>
                              <i className="fa-solid fa-trash text-sm" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {data?.users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-16 text-center text-sm" style={{ color: "#374151" }}>Хэрэглэгч олдсонгүй</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: B }}>
                <p className="text-xs" style={{ color: "#374151" }}>{data.page} / {data.totalPages} хуудас · {data.total} хэрэглэгч</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <i className="fa-solid fa-chevron-left text-sm" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <i className="fa-solid fa-chevron-right text-sm" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
