"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Search,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  History,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Overview",        href: "/dashboard",                icon: LayoutDashboard },
  { label: "New Search",      href: "/dashboard/new-search",     icon: Search },
  { label: "Search History",  href: "/dashboard/search-history", icon: History },
  { label: "Billing",         href: "/dashboard/billing",        icon: CreditCard },
  { label: "Settings",        href: "/dashboard/settings",       icon: Settings },
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

  return (
    <aside
      className={`flex flex-col bg-white border-r border-neutral-200 ${
        mobile ? "w-full h-full" : "w-[220px] min-h-screen fixed top-0 left-0 z-30"
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LeadMapper" className="w-7 h-7 object-contain" />
          <span className="font-display font-bold text-neutral-900 text-[1.0625rem]">LeadMapper</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 p-1">
            <X size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Credits block */}
      <div className={`mx-3 mb-3 border rounded-xl p-3.5 ${low ? "border-amber-200 bg-amber-50" : "border-neutral-200 bg-neutral-50"}`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-neutral-500">Credits remaining</span>
          <span className={`text-xs font-semibold ${low ? "text-amber-600" : "text-neutral-900"}`}>
            {creditsRemaining} / {creditsLimit}
          </span>
        </div>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-2.5">
          <div
            className={`h-full rounded-full transition-all ${low ? "bg-amber-500" : "bg-blue-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 capitalize">{plan} plan</span>
          <Link
            href="/dashboard/billing"
            onClick={onClose}
            className="flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-800 font-medium"
          >
            Upgrade
            <ChevronRight size={10} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-neutral-100 pt-3 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-700 transition-colors py-2 px-3 rounded-lg hover:bg-neutral-100"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Back to home
        </Link>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-700 transition-colors py-2 px-3 rounded-lg hover:bg-neutral-100 w-full"
        >
          <LogOut size={13} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  )
}

function TopBar({ onMenuClick, userInitial, plan }: { onMenuClick: () => void; userInitial: string; plan: string }) {
  const pathname = usePathname()
  const currentPage = navItems.find((n) => n.href === pathname)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-5 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-neutral-400 hover:text-neutral-900 p-1"
          onClick={onMenuClick}
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="hidden md:block">
          <h1 className="text-sm font-semibold text-neutral-900">{currentPage?.label ?? "Dashboard"}</h1>
          <p className="text-xs text-neutral-400">LeadMapper</p>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <img src="/logo.png" alt="LeadMapper" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-neutral-900 text-[0.9375rem]">LeadMapper</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 border border-neutral-200 bg-neutral-50 px-3 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {planLabel} Plan
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-[11px] font-bold text-white hidden md:flex">
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

      // Fetch profile for credits
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

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="bg-white w-[260px] h-full">
            <Sidebar mobile onClose={() => setMobileOpen(false)} {...sidebarProps} />
          </div>
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-[220px]">
        <TopBar onMenuClick={() => setMobileOpen(true)} userInitial={userInitial} plan={plan} />
        <main className="p-5 md:p-8">{children}</main>

        {/* Acceptable use notice */}
        <footer className="px-5 md:px-8 pb-6">
          <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-200 pt-4">
            <span className="font-semibold text-neutral-500">Acceptable use:</span>{" "}
            Exported data is for legitimate sales and marketing outreach only. Do not use leads to send spam, violate anti-spam laws (CAN-SPAM, GDPR), or harass individuals. Misuse may result in account termination.{" "}
            <a href="/terms" className="text-blue-700 hover:text-blue-800 underline underline-offset-2">Terms of Service</a>
            {" · "}
            <a href="/privacy" className="text-blue-700 hover:text-blue-800 underline underline-offset-2">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
