"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, AlertTriangle, Loader2, X, Trash2, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-neutral-900 mb-0.5">{title}</h2>
        <p className="text-xs text-neutral-400">{desc}</p>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  // Profile
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("free")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Notifications
  const [notifyExport, setNotifyExport]   = useState(true)
  const [notifyCredits, setNotifyCredits] = useState(true)
  const [notifyProduct, setNotifyProduct] = useState(false)
  const [notifySaving, setNotifySaving]   = useState(false)

  // Danger zone
  const [deleteConfirm, setDeleteConfirm]   = useState(false)
  const [deleteEmail, setDeleteEmail]       = useState("")
  const [deleteLoading, setDeleteLoading]   = useState(false)
  const [deleteError, setDeleteError]       = useState("")

  const router = useRouter()

  // ── Load user data ────────────────────────────────────────────────────────
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

  // ── Save profile ──────────────────────────────────────────────────────────
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

    // Update user_profiles table
    const { error: profileErr } = await supabase
      .from("user_profiles")
      .update({ full_name: name.trim() })
      .eq("id", user.id)

    // Also update user metadata so auth.getUser() returns the new name
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    })

    setProfileSaving(false)
    if (profileErr || metaErr) {
      setProfileMsg({ type: "error", text: profileErr?.message ?? metaErr?.message ?? "Failed to save." })
    } else {
      setProfileMsg({ type: "success", text: "Profile updated successfully." })
      setTimeout(() => setProfileMsg(null), 3000)
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)

    if (newPass.length < 8) {
      setPassMsg({ type: "error", text: "Password must be at least 8 characters." })
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "error", text: "Passwords don't match." })
      return
    }

    setPassSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setPassSaving(false)

    if (error) {
      setPassMsg({ type: "error", text: error.message })
    } else {
      setPassMsg({ type: "success", text: "Password updated successfully." })
      setNewPass("")
      setConfirmPass("")
      setTimeout(() => setPassMsg(null), 3000)
    }
  }

  // ── Save a single notification preference ────────────────────────────────────
  const saveNotificationPref = async (key: string, value: boolean) => {
    setNotifySaving(true)
    try {
      await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })
    } catch {
      // fail silently — UI state already updated
    } finally {
      setNotifySaving(false)
    }
  }

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Settings</h1>
        <p className="text-neutral-400 text-sm">Manage your profile, security, and notifications.</p>
      </div>

      {/* Profile */}
      <Section title="Profile" desc="Update your display name and view account information.">
        {profileLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-neutral-100 rounded-lg" />
            <div className="h-10 bg-neutral-100 rounded-lg" />
            <div className="h-9 w-28 bg-neutral-100 rounded-lg" />
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{name || "No name set"}</div>
                <div className="text-xs text-neutral-400">{email}</div>
                <div className="text-[11px] text-blue-600 mt-0.5">{planLabel} plan</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-neutral-400">Email cannot be changed after signup.</p>
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {profileMsg.type === "success" ? <Check size={14} strokeWidth={2.5} /> : <AlertTriangle size={14} strokeWidth={2} />}
                {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
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
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {passMsg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
              passMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {passMsg.type === "success" ? <Check size={14} strokeWidth={2.5} /> : <AlertTriangle size={14} strokeWidth={2} />}
              {passMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passSaving || !newPass || !confirmPass}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
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
            { label: "Export completed",    desc: "Email when a CSV export finishes.",                  state: notifyExport,  dbKey: "notify_export",  set: setNotifyExport  },
            { label: "Low credits warning", desc: "Email when you have fewer than 10 credits left.",    state: notifyCredits, dbKey: "notify_credits", set: setNotifyCredits },
            { label: "Product updates",     desc: "New features, improvements, and changelog.",         state: notifyProduct, dbKey: "notify_product", set: setNotifyProduct },
          ].map(({ label, desc, state, dbKey, set }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-neutral-800">{label}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{desc}</div>
              </div>
              <button
                type="button"
                disabled={notifySaving}
                onClick={() => {
                  const next = !state
                  set(next)
                  saveNotificationPref(dbKey, next)
                }}
                className={`w-10 h-[22px] rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors disabled:opacity-60 ${
                  state ? "bg-blue-600" : "bg-neutral-200"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${state ? "translate-x-[18px]" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" desc="Irreversible account actions.">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-0.5">Delete account</p>
            <p className="text-xs text-neutral-400">
              Permanently deletes your account, all searches, leads, and cancels any active subscription.
              This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => { setDeleteConfirm(true); setDeleteEmail(""); setDeleteError("") }}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Trash2 size={14} strokeWidth={2} />
            Delete my account
          </button>
        </div>
      </Section>

      {/* ── Delete account modal ──────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" strokeWidth={2} />
            </div>

            <h3 className="font-display font-bold text-lg text-neutral-900 mb-1">Delete your account?</h3>
            <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
              This will permanently delete your account, all saved leads, search history, and cancel any
              active subscription. <strong className="text-neutral-700">This cannot be undone.</strong>
            </p>

            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-5 space-y-1">
              <p className="text-xs font-semibold text-red-700">What gets deleted:</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                <li>Your profile and account credentials</li>
                <li>All searches and saved leads</li>
                <li>Active subscription (cancelled immediately)</li>
              </ul>
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Type your email to confirm
              </label>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => { setDeleteEmail(e.target.value); setDeleteError("") }}
                placeholder={email}
                className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20 transition-all"
              />
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
                <AlertTriangle size={13} className="text-red-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-red-700">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
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
                    // Sign out locally then redirect — auth user is already deleted server-side
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.replace("/")
                  } catch (err) {
                    setDeleteError(err instanceof Error ? err.message : "Something went wrong.")
                    setDeleteLoading(false)
                  }
                }}
                disabled={deleteLoading || !deleteEmail}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Deleting…</>
                  : "Delete account"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
