"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [avatarModal, setAvatarModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        reject(new Error("Зөвхөн JPG, PNG, WEBP зургийг оруулна уу")); return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("Зургийн хэмжээ 5MB-аас бага байх ёстой")); return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 300;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Зураг уншихад алдаа гарлаа")); };
      img.src = url;
    });
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    setAvatarError("");
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function confirmAvatarUpload() {
    if (!previewFile) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const avatarUrl = await compressImage(previewFile);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      if (!res.ok) { setAvatarError("Зураг хадгалахад алдаа гарлаа"); return; }
      setForm((prev) => ({ ...prev, avatarUrl }));
      setData((prev) => prev ? {
        ...prev,
        profile: prev.profile
          ? { ...prev.profile, avatarUrl }
          : { avatarUrl, bio: null, phone: null, location: null, skills: null, experience: null, companyName: null, industry: null },
      } : prev);
      closeModal();
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeAvatar() {
    setUploadingAvatar(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: "" }),
    });
    if (res.ok) {
      setForm((prev) => ({ ...prev, avatarUrl: "" }));
      setData((prev) => prev ? { ...prev, profile: prev.profile ? { ...prev.profile, avatarUrl: null } : prev.profile } : prev);
    }
    setUploadingAvatar(false);
    closeModal();
  }

  function closeModal() {
    setAvatarModal(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setDragOver(false);
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
            Профайл
          </h1>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            Мэдээллээ шинэчлэх
          </p>
        </div>
      </div>

      {/* Avatar modal */}
      {avatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5" style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold" style={{ color: "#111827" }}>Профайл зураг</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" style={{ color: "#6B7280" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Preview or upload zone */}
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-2xl object-cover border-2" style={{ borderColor: "#4B7BF5" }} />
                <p className="text-xs text-center" style={{ color: "#6B7280" }}>Зураг сонгогдлоо. Хадгалахуу?</p>
                <div className="flex gap-2 w-full">
                  <button onClick={() => { setPreviewUrl(null); setPreviewFile(null); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                    style={{ color: "#374151", borderColor: "#E2E7EF" }}>
                    Өөр зураг
                  </button>
                  <button onClick={() => void confirmAvatarUpload()} disabled={uploadingAvatar}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#4B7BF5" }}>
                    {uploadingAvatar
                      ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Хадгалж байна...</>
                      : <><i className="fa-solid fa-check text-sm" />Хадгалах</>}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 px-4 cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? "#4B7BF5" : "#D1D5DB"}`,
                  background: dragOver ? "#EEF2FE" : "#F9FAFB",
                }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EEF2FE" }}>
                  <i className="fa-solid fa-cloud-arrow-up text-2xl" style={{ color: "#4B7BF5" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "#111827" }}>Зураг оруулах</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Drag & drop эсвэл товшиж сонгоно уу</p>
                  <p className="text-xs mt-1" style={{ color: "#D1D5DB" }}>JPG, PNG, WEBP · Дээд тал 5MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)} />
              </div>
            )}

            {avatarError && (
              <p className="text-xs text-center px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626" }}>{avatarError}</p>
            )}

            {form.avatarUrl && !previewUrl && (
              <button onClick={() => void removeAvatar()} disabled={uploadingAvatar}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-red-50 flex items-center justify-center gap-2 border"
                style={{ color: "#EF4444", borderColor: "#FECDD3" }}>
                <i className="fa-solid fa-trash text-sm" />
                Зураг устгах
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: "linear-gradient(135deg, #0D1117 0%, #1A2440 100%)" }}
      >
        <button onClick={() => setAvatarModal(true)} className="relative w-16 h-16 shrink-0 group" title="Зураг солих">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatarUrl} alt="Profile avatar" className="w-16 h-16 rounded-2xl object-cover border" style={{ borderColor: "rgba(255,255,255,0.25)" }} />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #4B7BF5, #6B94F8)" }}>
              {form.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.45)" }}>
            <i className="fa-solid fa-camera text-white text-base" />
          </div>
          <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full flex items-center justify-center border-2"
            style={{ background: "#4B7BF5", borderColor: "#0D1117" }}>
            <i className="fa-solid fa-pen text-[9px] text-white" />
          </div>
        </button>
        <div className="flex-1">
          <p className="font-extrabold text-white text-lg">{form.name || "-"}</p>
          <p className="text-sm" style={{ color: "#99F6E4" }}>{data.email}</p>
          <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(13,148,136,0.25)", color: "#5EEAD4" }}>
            {badgeText}
          </span>
          <button onClick={() => setAvatarModal(true)}
            className="block mt-2 text-[11px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: "#C4D8FD" }}>
            <i className="fa-solid fa-camera mr-1" />
            Зураг солих
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
          <p className="text-sm font-bold" style={{ color: "#111827" }}>
            Үндсэн мэдээлэл
          </p>

          <Field label="Нэр" icon={<i className="fa-solid fa-user text-sm" />}>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Таны нэр"
            />
          </Field>

          <Field label="Имэйл" icon={<i className="fa-solid fa-envelope text-sm" />}>
            <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} value={data.email} disabled />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Утас" icon={<i className="fa-solid fa-phone text-sm" />}>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="99xxxxxx"
              />
            </Field>
            <Field label="Байршил" icon={<i className="fa-solid fa-location-dot text-sm" />}>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Улаанбаатар"
              />
            </Field>
          </div>

          <Field label="Танилцуулга" icon={<i className="fa-solid fa-file-lines text-sm" />}>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Өөрийгөө товч танилцуулна уу..."
            />
          </Field>
        </div>

        {!isAdmin && (
          <div className="rounded-2xl border p-6 space-y-4" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
            {isEmployer ? (
              <>
                <p className="text-sm font-bold" style={{ color: "#111827" }}>
                  Байгууллагын мэдээлэл
                </p>
                <Field label="Байгууллагын нэр" icon={<i className="fa-solid fa-building text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Байгууллагын нэр"
                  />
                </Field>
                <Field label="Салбар" icon={<i className="fa-solid fa-briefcase text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="Салбар чиглэл"
                  />
                </Field>
              </>
            ) : (
              <>
                <p className="text-sm font-bold" style={{ color: "#111827" }}>
                  Мэргэжлийн мэдээлэл
                </p>
                <Field label="Ур чадвар" icon={<i className="fa-solid fa-tag text-sm" />}>
                  <input
                    style={inputStyle}
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="React, TypeScript..."
                  />
                </Field>
                <Field label="Туршлага" icon={<i className="fa-solid fa-briefcase text-sm" />}>
                  <textarea
                    rows={4}
                    style={{ ...inputStyle, resize: "none" }}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="Ажлын туршлагаа оруулна уу..."
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
              Хадгалж байна...
            </>
          ) : saved ? (
            <>
              <i className="fa-solid fa-check text-sm" />
              Хадгалагдлаа
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk text-sm" />
              Хадгалах
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
