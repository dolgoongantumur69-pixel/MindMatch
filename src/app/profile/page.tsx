"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  name: string;
  email: string;
  role: "JOBSEEKER" | "EMPLOYER" | "ADMIN";
  createdAt: string;
  profile: {
    avatarUrl: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    skills: string | null;
    experience: string | null;
    companyName: string | null;
    industry: string | null;
  } | null;
}

const inputStyle = {
  border: "1.5px solid #E2E7EF",
  background: "#F7F8FA",
  color: "#111827",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
} as const;

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    name: "",
    avatarUrl: "",
    bio: "",
    phone: "",
    location: "",
    skills: "",
    experience: "",
    companyName: "",
    industry: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d: ProfileData) => {
        setData(d);
        setForm({
          name: d.name ?? "",
          avatarUrl: d.profile?.avatarUrl ?? "",
          bio: d.profile?.bio ?? "",
          phone: d.profile?.phone ?? "",
          location: d.profile?.location ?? "",
          skills: d.profile?.skills ?? "",
          experience: d.profile?.experience ?? "",
          companyName: d.profile?.companyName ?? "",
          industry: d.profile?.industry ?? "",
        });
      });
  }, [session]);

  const isEmployer = data?.role === "EMPLOYER";
  const isAdmin = data?.role === "ADMIN";
  const backHref = useMemo(() => {
    if (isEmployer) return "/employer/dashboard";
    if (isAdmin) return "/admin";
    return "/dashboard";
  }, [isEmployer, isAdmin]);

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        reject(new Error("Зөвхөн JPG, PNG, WEBP зургийг оруулна уу"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("Зургийн хэмжээ 5MB-аас бага байх ёстой"));
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Зураг уншихад алдаа гарлаа")); };
      img.src = url;
    });
  }

  async function handleAvatarUpload(file: File | null) {
    if (!file) return;
    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const avatarUrl = await compressImage(file);
      const saveRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      if (!saveRes.ok) {
        setAvatarError("Зураг хадгалахад алдаа гарлаа");
      } else {
        setForm((prev) => ({ ...prev, avatarUrl }));
        setData((prev) =>
          prev ? {
            ...prev,
            profile: prev.profile
              ? { ...prev.profile, avatarUrl }
              : { avatarUrl, bio: null, phone: null, location: null, skills: null, experience: null, companyName: null, industry: null },
          } : prev
        );
      }
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const json = (await res.json()) as { name?: string };
      await update({ name: json.name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (status === "loading" || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const badgeText = isAdmin ? "Админ" : isEmployer ? "Ажил олгогч" : "Ажил хайгч";

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="p-2 rounded-xl transition-all hover:opacity-70"
          style={{ background: "#F0FDFA", color: "#4B7BF5" }}
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "#111827" }}>
            Profile
          </h1>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            Update your account
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: "linear-gradient(135deg, #0D1117 0%, #1A2440 100%)" }}
      >
        <div className="relative w-16 h-16 shrink-0">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt="Profile avatar"
              className="w-16 h-16 rounded-2xl object-cover border"
              style={{ borderColor: "rgba(255,255,255,0.25)" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #4B7BF5, #6B94F8)" }}
            >
              {form.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <label
            className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border"
            style={{ background: "#EEF2FE", borderColor: "#D5E3FC", color: "#4B7BF5" }}
            title="Upload avatar"
          >
            <i className="fa-solid fa-camera text-xs" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0] ?? null)}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-white text-lg">{form.name || "-"}</p>
          <p className="text-sm" style={{ color: "#99F6E4" }}>
            {data.email}
          </p>
          <span
            className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(13,148,136,0.25)", color: "#5EEAD4" }}
          >
            {badgeText}
          </span>
          {uploadingAvatar && (
            <p className="text-[11px] mt-2" style={{ color: "#C4D8FD" }}>
              Uploading avatar...
            </p>
          )}
          {avatarError && (
            <p className="text-[11px] mt-2" style={{ color: "#FCA5A5" }}>
              {avatarError}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
          <p className="text-sm font-bold" style={{ color: "#111827" }}>
            Basic Info
          </p>

          <Field label="Name" icon={<i className="fa-solid fa-user text-sm" />}>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </Field>

          <Field label="Email" icon={<i className="fa-solid fa-envelope text-sm" />}>
            <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} value={data.email} disabled />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" icon={<i className="fa-solid fa-phone text-sm" />}>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="99xxxxxx"
              />
            </Field>
            <Field label="Location" icon={<i className="fa-solid fa-location-dot text-sm" />}>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ulaanbaatar"
              />
            </Field>
          </div>

          <Field label="Bio" icon={<i className="fa-solid fa-file-lines text-sm" />}>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Short bio..."
            />
          </Field>
        </div>

        {!isAdmin && (
          <div className="rounded-2xl border p-6 space-y-4" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
            {isEmployer ? (
              <>
                <p className="text-sm font-bold" style={{ color: "#111827" }}>
                  Company Info
                </p>
                <Field label="Company Name" icon={<i className="fa-solid fa-building text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Company name"
                  />
                </Field>
                <Field label="Industry" icon={<i className="fa-solid fa-briefcase text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="Industry"
                  />
                </Field>
              </>
            ) : (
              <>
                <p className="text-sm font-bold" style={{ color: "#111827" }}>
                  Professional Info
                </p>
                <Field label="Skills" icon={<i className="fa-solid fa-tag text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="React, TypeScript..."
                  />
                </Field>
                <Field label="Experience" icon={<i className="fa-solid fa-briefcase text-sm" />}>
                  <textarea
                    rows={4}
                    style={{ ...inputStyle, resize: "none" }}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="Work experience..."
                  />
                </Field>
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: saved
              ? "linear-gradient(135deg, #3B6AE8, #111827)"
              : "linear-gradient(135deg, #4B7BF5, #0F766E)",
            boxShadow: "0 4px 16px rgba(13,148,136,0.30)",
          }}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <i className="fa-solid fa-check text-sm" />
              Saved
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk text-sm" />
              Save
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
        <span style={{ color: "#4B7BF5" }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
