"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[12px] shadow-brutal p-6">
      <div className="mb-5 pb-4 border-b-2 border-[#EFEBE0]">
        <h2 className="font-kalam font-bold text-base text-[#1A1A1A] mb-0.5">{title}</h2>
        <p className="font-jetbrains text-[11px] text-[#6B6B6B]">{desc}</p>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("free")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [notifyExport, setNotifyExport]   = useState(true)
  const [notifyCredits, setNotifyCredits] = useState(true)
  const [notifyProduct, setNotifyProduct] = useState(false)
  const [notifySaving, setNotifySaving]   = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteEmail, setDeleteEmail]     = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError]     = useState("")

  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? "")
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, plan, notify_export, notify_credits, notify_product")
        .eq("id", user.id)
        .single()
      if (profile) {
        setName(profile.full_name ?? user.user_metadata?.full_name ?? "")
        setPlan(profile.plan ?? "free")
        setNotifyExport(profile.notify_export  ?? true)
        setNotifyCredits(profile.notify_credits ?? true)
        setNotifyProduct(profile.notify_product ?? false)
      } else {
        setName(user.user_metadata?.full_name ?? "")
      }
      setProfileLoading(false)
    }
    load()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setProfileMsg({ type: "error", text: "Name cannot be empty." })
      return
    }
    setProfileSaving(true)
    setProfileMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: profileErr } = await supabase.from("user_profiles").update({ full_name: name.trim() }).eq("id", user.id)
    const { error: metaErr }    = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setProfileSaving(false)
    if (profileErr || metaErr) {
      setProfileMsg({ type: "error", text: profileErr?.message ?? metaErr?.message ?? "Failed to save." })
    } else {
      setProfileMsg({ type: "success", text: "Profile updated successfully." })
      setTimeout(() => setProfileMsg(null), 3000)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)
    if (newPass.length < 8) { setPassMsg({ type: "error", text: "Password must be at least 8 characters." }); return }
    if (newPass !== confirmPass) { setPassMsg({ type: "error", text: "Passwords don't match." }); return }
    setPassSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setPassSaving(false)
    if (error) {
      setPassMsg({ type: "error", text: error.message })
    } else {
      setPassMsg({ type: "success", text: "Password updated successfully." })
      setNewPass(""); setConfirmPass("")
      setTimeout(() => setPassMsg(null), 3000)
    }
  }

  const saveNotificationPref = async (key: string, value: boolean) => {
    setNotifySaving(true)
    try {
      await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })
    } catch { /* fail silently */ } finally { setNotifySaving(false) }
  }

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  // Input class reused
  const inputCls = "w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-2.5 outline-none focus:shadow-brutal transition-all"

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-1">Settings</h2>
        <p className="font-jetbrains text-[12px] text-[#6B6B6B]">Manage your profile, security, and notifications.</p>
      </div>

      {/* Profile */}
      <Section title="Profile" desc="Update your display name and view account information.">
        {profileLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-[#EFEBE0] rounded-[8px]" />
            <div className="h-10 bg-[#EFEBE0] rounded-[8px]" />
            <div className="h-9 w-28 bg-[#EFEBE0] rounded-[8px]" />
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-[10px] bg-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center font-kalam font-bold text-xl text-[#FFE45E] flex-shrink-0 shadow-brutal">
                {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-kalam font-bold text-[#1A1A1A]">{name || "No name set"}</div>
                <div className="font-jetbrains text-[11px] text-[#6B6B6B]">{email}</div>
                <div className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] bg-[#FFE45E] border border-[#1A1A1A] rounded-[4px] px-1.5 py-0.5 mt-1 inline-block">{planLabel} plan</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Email address</label>
              <input type="email" value={email} disabled className="w-full font-kalam text-sm text-[#B8B5AA] bg-[#EFEBE0]/50 border-2 border-[#B8B5AA] rounded-[10px] px-4 py-2.5 cursor-not-allowed" />
              <p className="font-jetbrains text-[10px] text-[#B8B5AA]">Email cannot be changed after signup.</p>
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 font-kalam text-sm px-4 py-3 rounded-[8px] border-2 ${
                profileMsg.type === "success"
                  ? "bg-[#6FCF97]/20 border-[#6FCF97] text-[#1A1A1A]"
                  : "bg-[#FF6B5C]/10 border-[#FF6B5C] text-[#FF6B5C]"
              }`}>
                {profileMsg.type === "success" ? "✓" : "⚠"} {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-2.5 text-sm btn-press shadow-brutal disabled:opacity-50 flex items-center gap-2"
            >
              {profileSaving && <Loader2 size={14} className="animate-spin" />}
              {profileSaving ? "Saving…" : "Save profile"}
            </button>
          </form>
        )}
      </Section>

      {/* Password */}
      <Section title="Password" desc="Change your password to keep your account secure.">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {passMsg && (
            <div className={`flex items-center gap-2 font-kalam text-sm px-4 py-3 rounded-[8px] border-2 ${
              passMsg.type === "success"
                ? "bg-[#6FCF97]/20 border-[#6FCF97] text-[#1A1A1A]"
                : "bg-[#FF6B5C]/10 border-[#FF6B5C] text-[#FF6B5C]"
            }`}>
              {passMsg.type === "success" ? "✓" : "⚠"} {passMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passSaving || !newPass || !confirmPass}
            className="font-kalam font-bold text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-2.5 text-sm btn-press shadow-brutal disabled:opacity-50 flex items-center gap-2"
          >
            {passSaving && <Loader2 size={14} className="animate-spin" />}
            {passSaving ? "Updating…" : "Update password"}
          </button>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" desc="Choose what emails you receive from LeadMapper.">
        <div className="space-y-4">
          {[
            { label: "Export completed",    desc: "Email when a CSV export finishes.",               state: notifyExport,  dbKey: "notify_export",  set: setNotifyExport  },
            { label: "Low credits warning", desc: "Email when you have fewer than 10 credits left.",  state: notifyCredits, dbKey: "notify_credits", set: setNotifyCredits },
            { label: "Product updates",     desc: "New features, improvements, and changelog.",       state: notifyProduct, dbKey: "notify_product", set: setNotifyProduct },
          ].map(({ label, desc, state, dbKey, set }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-[#EFEBE0] last:border-0">
              <div>
                <div className="font-kalam font-bold text-[#1A1A1A] text-sm">{label}</div>
                <div className="font-jetbrains text-[10px] text-[#6B6B6B] mt-0.5">{desc}</div>
              </div>
              <button
                type="button"
                disabled={notifySaving}
                onClick={() => {
                  const next = !state
                  set(next)
                  saveNotificationPref(dbKey, next)
                }}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 flex-shrink-0 border-2 transition-all disabled:opacity-60 ${
                  state ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-[#EFEBE0] border-[#B8B5AA]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#F7F4EC] shadow-sm transition-transform border border-[#1A1A1A]/20 ${state ? "translate-x-[20px]" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" desc="Irreversible account actions.">
        <div className="space-y-3">
          <div>
            <p className="font-kalam font-bold text-[#1A1A1A] text-sm mb-0.5">Delete account</p>
            <p className="font-jetbrains text-[11px] text-[#6B6B6B]">
              Permanently deletes your account, all searches, leads, and cancels any active subscription. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => { setDeleteConfirm(true); setDeleteEmail(""); setDeleteError("") }}
            className="font-kalam font-bold text-sm text-[#F7F4EC] bg-[#FF6B5C] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-2.5 btn-press shadow-brutal flex items-center gap-2"
          >
            🗑 Delete my account
          </button>
        </div>
      </Section>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[14px] shadow-brutal-lg w-full max-w-md p-6 relative">
            <button onClick={() => setDeleteConfirm(false)} className="absolute top-4 right-4 font-bold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-lg">✕</button>

            <div className="w-10 h-10 bg-[#FF6B5C]/20 border-2 border-[#FF6B5C] rounded-[8px] flex items-center justify-center mb-4 text-xl">🗑</div>
            <h3 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-1">Delete your account?</h3>
            <p className="font-kalam text-sm text-[#6B6B6B] mb-5 leading-relaxed">
              This will permanently delete your account, all saved leads, search history, and cancel any active subscription. <strong className="text-[#1A1A1A]">This cannot be undone.</strong>
            </p>

            <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 mb-5 space-y-1">
              <p className="font-jetbrains text-[10px] font-bold text-[#FF6B5C] uppercase tracking-wider">What gets deleted:</p>
              <ul className="font-kalam text-sm text-[#FF6B5C] space-y-0.5 list-disc list-inside">
                <li>Your profile and account credentials</li>
                <li>All searches and saved leads</li>
                <li>Active subscription (cancelled immediately)</li>
              </ul>
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="font-jetbrains text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                Type your email to confirm
              </label>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => { setDeleteEmail(e.target.value); setDeleteError("") }}
                placeholder={email}
                className="w-full font-kalam text-sm text-[#1A1A1A] placeholder:text-[#B8B5AA] bg-[#EFEBE0] border-2 border-[#FF6B5C] rounded-[10px] px-4 py-2.5 outline-none"
              />
            </div>

            {deleteError && (
              <div className="bg-[#FF6B5C]/10 border-2 border-[#FF6B5C] rounded-[8px] px-4 py-3 mb-4">
                <p className="font-kalam text-sm text-[#FF6B5C]">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#EFEBE0] border-2 border-[#1A1A1A] text-[#1A1A1A] btn-press">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteEmail.trim().toLowerCase() !== email.toLowerCase()) {
                    setDeleteError("Email doesn't match. Please type your email exactly.")
                    return
                  }
                  setDeleteLoading(true)
                  setDeleteError("")
                  try {
                    const res  = await fetch("/api/account", { method: "DELETE" })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Failed to delete account")
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.replace("/")
                  } catch (err) {
                    setDeleteError(err instanceof Error ? err.message : "Something went wrong.")
                    setDeleteLoading(false)
                  }
                }}
                disabled={deleteLoading || !deleteEmail}
                className="flex-1 py-2.5 rounded-[8px] font-kalam font-bold text-sm bg-[#FF6B5C] border-2 border-[#1A1A1A] text-[#F7F4EC] btn-press shadow-brutal disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
