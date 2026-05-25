"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20 L4 4"/><path d="M4 20 L20 20"/>
        <path d="M7 16 L7 12"/><path d="M11 16 L11 9"/>
        <path d="M15 16 L15 13"/><path d="M19 16 L19 7"/>
      </svg>
    ),
  },
  {
    label: "New Search",
    href: "/dashboard/new-search",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/>
      </svg>
    ),
  },
  {
    label: "Search History",
    href: "/dashboard/search-history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5 L17 5 L19 7 L19 19 L5 19 Z"/>
        <path d="M8 5 L8 11 L16 11 L16 5"/>
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4 L14 4 L19 9 L19 20 L6 20 Z"/>
        <path d="M14 4 L14 9 L19 9"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6 L20 6"/><path d="M7 12 L17 12"/><path d="M10 18 L14 18"/>
      </svg>
    ),
  },
]

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
  onSignOut?: () => void
  creditsUsed: number
  creditsLimit: number
  plan: string
}

function Sidebar({ mobile = false, onClose, onSignOut, creditsUsed, creditsLimit, plan }: SidebarProps) {
  const pathname = usePathname()
  const creditsRemaining = creditsLimit - creditsUsed
  const pct = creditsLimit > 0 ? Math.min((creditsUsed / creditsLimit) * 100, 100) : 0
  const low = creditsRemaining <= Math.ceil(creditsLimit * 0.15)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <aside
      className={`flex flex-col bg-[#F7F4EC] border-r-2 border-[#1A1A1A] ${
        mobile ? "w-full h-full" : "w-[200px] min-h-screen fixed top-0 left-0 z-30"
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b-2 border-[#1A1A1A] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LeadMapper" className="w-6 h-6 object-contain" />
          <span className="font-kalam font-bold text-[#1A1A1A] text-[1.1rem]">LeadMapper</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-[#1A1A1A] hover:opacity-60 p-1 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 L6 18"/><path d="M6 6 L18 18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map(({ label, href, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-kalam font-bold transition-all ${
                active
                  ? "bg-[#FFE45E] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-brutal"
                  : "text-[#3A3A3A] hover:bg-[#EFEBE0] border-2 border-transparent hover:border-[#1A1A1A]"
              }`}
            >
              <span className={active ? "text-[#1A1A1A]" : "text-[#6B6B6B]"}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Credits block */}
      <div className="mx-3 mb-2 bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-[10px] shadow-brutal p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-jetbrains text-[10px] font-bold text-[#1A1A1A] tracking-wider uppercase">Credits</span>
          <span className="font-jetbrains text-[11px] font-bold text-[#1A1A1A]">
            {creditsRemaining} / {creditsLimit}
          </span>
        </div>
        <div className="h-2 bg-[#1A1A1A]/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#1A1A1A] rounded-full transition-all"
            style={{ width: `${100 - pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-kalam text-[12px] text-[#3A3A3A]">{planLabel} Plan</span>
          <Link
            href="/dashboard/billing"
            onClick={onClose}
            className="font-kalam font-bold text-[11px] text-[#1A1A1A] bg-[#FF6B5C] border border-[#1A1A1A] rounded-[6px] px-2 py-0.5 hover:opacity-80 transition-opacity"
          >
            Upgrade →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t-2 border-[#1A1A1A] space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors py-1.5 px-3 rounded-[8px] hover:bg-[#EFEBE0]"
        >
          ← Back to home
        </Link>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 font-kalam text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors py-1.5 px-3 rounded-[8px] hover:bg-[#EFEBE0] w-full text-left"
        >
          ↳ Log out
        </button>
      </div>
    </aside>
  )
}

function TopBar({
  onMenuClick,
  userInitial,
  plan,
  creditsRemaining,
  creditsLimit,
}: {
  onMenuClick: () => void
  userInitial: string
  plan: string
  creditsRemaining: number
  creditsLimit: number
}) {
  const pathname = usePathname()
  const currentPage = navItems.find((n) => n.href === pathname)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <header className="h-14 border-b-2 border-[#1A1A1A] bg-[#F7F4EC] flex items-center justify-between px-5 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-[#1A1A1A] hover:opacity-60 p-1 transition-opacity"
          onClick={onMenuClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 6 L21 6"/><path d="M3 12 L21 12"/><path d="M3 18 L21 18"/>
          </svg>
        </button>

        <div className="hidden md:block">
          <h1 className="font-kalam font-bold text-[#1A1A1A] text-base">{currentPage?.label ?? "Dashboard"}</h1>
          <p className="font-jetbrains text-[10px] text-[#6B6B6B]">LeadMapper</p>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <img src="/logo.png" alt="LeadMapper" className="w-6 h-6 object-contain" />
          <span className="font-kalam font-bold text-[#1A1A1A] text-[0.9375rem]">LeadMapper</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 font-jetbrains text-[11px] font-bold text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-[8px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6FCF97]" />
          {creditsRemaining} credits · {planLabel}
        </div>
        <div className="w-8 h-8 rounded-[8px] bg-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-[11px] font-kalam font-bold text-[#FFE45E] hidden md:flex shadow-brutal">
          {userInitial}
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userInitial, setUserInitial] = useState("U")
  const [creditsUsed, setCreditsUsed] = useState(0)
  const [creditsLimit, setCreditsLimit] = useState(50)
  const [plan, setPlan] = useState("free")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const name = user.user_metadata?.full_name as string | undefined
      const initial = name ? name.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() ?? "U")
      setUserInitial(initial)

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("credits_used, credits_limit, plan")
        .eq("id", user.id)
        .single()

      if (profile) {
        setCreditsUsed(profile.credits_used ?? 0)
        setCreditsLimit(profile.credits_limit ?? 50)
        setPlan(profile.plan ?? "free")
      }
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const sidebarProps = { creditsUsed, creditsLimit, plan, onSignOut: handleSignOut }
  const creditsRemaining = creditsLimit - creditsUsed

  return (
    <div className="min-h-screen bg-[#F7F4EC]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="bg-[#F7F4EC] w-[240px] h-full">
            <Sidebar mobile onClose={() => setMobileOpen(false)} {...sidebarProps} />
          </div>
          <div
            className="flex-1 bg-[#1A1A1A]/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-[200px]">
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          userInitial={userInitial}
          plan={plan}
          creditsRemaining={creditsRemaining}
          creditsLimit={creditsLimit}
        />
        <main className="p-5 md:p-8">{children}</main>

        {/* Footer notice */}
        <footer className="px-5 md:px-8 pb-6">
          <div className="border-t-2 border-[#1A1A1A]/10 pt-4">
            <p className="font-jetbrains text-[10px] text-[#6B6B6B] leading-relaxed">
              <span className="font-bold text-[#3A3A3A]">Acceptable use:</span>{" "}
              Exported data is for legitimate sales and marketing outreach only. Do not send spam or violate CAN-SPAM/GDPR.{" "}
              <a href="/terms" className="text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Terms</a>
              {" · "}
              <a href="/privacy" className="text-[#1A1A1A] underline underline-offset-2 hover:opacity-70">Privacy</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
