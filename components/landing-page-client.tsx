"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Search, Download, Menu, X, MapPin, ArrowRight,
  Check, ChevronDown, Star, Clock, Filter, History,
} from "lucide-react"

// ─── Persona data ─────────────────────────────────────────────────────────────

type Lead = { name: string; phone: string; rating: string }

type Persona = {
  id: string
  label: string
  forLabel: string
  headline: string
  headlineAccent: string
  body: string
  stat: string
  statLabel: string
  statContext: string
  quote: string
  attribution: string
  avatarInitials: string
  demoKeyword: string
  demoLocation: string
  demoTag: string
  demoResults: string
  demoTime: string
  demoLeads: Lead[]
}

const PERSONAS: Persona[] = [
  {
    id: "agency",
    label: "Marketing agency",
    forLabel: "Marketing agencies",
    headline: "Prospect new clients,",
    headlineAccent: "city by city.",
    body: "Pitch local businesses by territory. Build a list of every gym in Miami — or every dentist in Austin — in 30 seconds.",
    stat: "80%",
    statLabel: "less prospecting time",
    statContext: "WHAT MARKETING AGENCIES SEE",
    quote: '"We pitch by city. LeadMapper lets us show a client every salon in their territory in our first call."',
    attribution: "Sarah M. · Agency founder",
    avatarInitials: "SM",
    demoKeyword: "gyms",
    demoLocation: "Miami, FL",
    demoTag: "MARKETING AGENCY",
    demoResults: "53",
    demoTime: "0.4s",
    demoLeads: [
      { name: "Wynwood Strength Co.", phone: "305-441-1102", rating: "4.9" },
      { name: "South Beach Fitness",  phone: "305-672-8800", rating: "4.7" },
      { name: "Brickell Iron Gym",    phone: "305-358-4422", rating: "4.5" },
      { name: "Coral Gables Pilates", phone: "305-444-2010", rating: "4.6" },
    ],
  },
  {
    id: "sdr",
    label: "SDR / sales team",
    forLabel: "SDRs",
    headline: "Fill your CRM with",
    headlineAccent: "verified contacts.",
    body: "Stop spending hours on manual research. Get verified phone numbers and websites for every prospect in your territory.",
    stat: "3×",
    statLabel: "more outreach daily",
    statContext: "WHAT SDR TEAMS SEE",
    quote: '"I hit my quota every week since switching. The phone data alone is worth it."',
    attribution: "James R. · Senior SDR",
    avatarInitials: "JR",
    demoKeyword: "dentists",
    demoLocation: "Austin, TX",
    demoTag: "SDR TEAM",
    demoResults: "47",
    demoTime: "0.3s",
    demoLeads: [
      { name: "Austin Dental Care",    phone: "512-340-8820", rating: "4.8" },
      { name: "Downtown Smiles",        phone: "512-442-1190", rating: "4.6" },
      { name: "Bright Teeth Studio",    phone: "512-891-4420", rating: "4.5" },
      { name: "Capitol City Dental",    phone: "512-223-7734", rating: "4.7" },
    ],
  },
  {
    id: "emailer",
    label: "Cold emailer",
    forLabel: "Cold emailers",
    headline: "Build cold lists",
    headlineAccent: "in 30 seconds.",
    body: "Filter for businesses with websites. Export 200 verified leads. Start your sequence before your coffee gets cold.",
    stat: "200",
    statLabel: "leads per search",
    statContext: "WHAT COLD EMAILERS SEE",
    quote: '"I export a new list every morning. It\'s just part of my routine now."',
    attribution: "Priya S. · Cold email specialist",
    avatarInitials: "PS",
    demoKeyword: "restaurants",
    demoLocation: "New York, NY",
    demoTag: "COLD EMAILER",
    demoResults: "127",
    demoTime: "0.5s",
    demoLeads: [
      { name: "Joe's Pizza",   phone: "212-555-0192", rating: "4.7" },
      { name: "Bella Roma",    phone: "212-555-0847", rating: "4.5" },
      { name: "Harbor Grill",  phone: "212-555-0334", rating: "4.8" },
      { name: "Taco Corner",   phone: "212-555-0721", rating: "4.3" },
    ],
  },
  {
    id: "seo",
    label: "Local SEO",
    forLabel: "Local SEO agencies",
    headline: "Find businesses",
    headlineAccent: "without websites.",
    body: "Filter for businesses with no website — your easiest clients. Get their phone number and call them today.",
    stat: "40%",
    statLabel: "of local biz have no website",
    statContext: "WHAT LOCAL SEO AGENCIES SEE",
    quote: '"I find restaurants without websites every morning. CSV goes straight into my CRM."',
    attribution: "Mike T. · Local SEO consultant",
    avatarInitials: "MT",
    demoKeyword: "plumbers",
    demoLocation: "Chicago, IL",
    demoTag: "LOCAL SEO",
    demoResults: "38",
    demoTime: "0.2s",
    demoLeads: [
      { name: "Chicago Fix-It Pro",   phone: "773-555-0291", rating: "4.4" },
      { name: "Windy City Plumbing",  phone: "312-555-0834", rating: "4.6" },
      { name: "Lake Shore Pipes",     phone: "773-555-0127", rating: "4.2" },
      { name: "North Side Drains",    phone: "312-555-0659", rating: "4.5" },
    ],
  },
]

// ─── Shared button classes ─────────────────────────────────────────────────────

const btnPrimary =
  "font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-organic px-6 py-3 inline-flex items-center gap-2 cursor-pointer shadow-brutal btn-press select-none"

const btnPrimaryLg =
  "font-kalam font-bold text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-organic-lg px-7 py-3.5 text-lg inline-flex items-center gap-2 cursor-pointer shadow-brutal btn-press select-none"

const btnGhost =
  "font-kalam font-bold text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic px-6 py-3 inline-flex items-center gap-2 cursor-pointer shadow-brutal btn-press select-none"

const btnGhostLg =
  "font-kalam font-bold text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg px-7 py-3.5 text-lg inline-flex items-center gap-2 cursor-pointer shadow-brutal btn-press select-none"

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen]         = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        supabase.auth.signOut({ scope: "local" }).catch(() => {})
        setLoggedIn(false)
        return
      }
      setLoggedIn(!!user)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-[#F7F4EC] border-b-2 border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LeadMapper" className="w-8 h-8 object-contain" />
          <span className="font-kalam font-bold text-[#1A1A1A] text-[1.35rem] leading-none">LeadMapper</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] text-[#3A3A3A]">
          <a href="#features"     className="hover:text-[#1A1A1A] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1A1A1A] transition-colors">How it works</a>
          <a href="#pricing"      className="hover:text-[#1A1A1A] transition-colors">Pricing</a>
          <a href="#faq"          className="hover:text-[#1A1A1A] transition-colors">FAQ</a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className={btnPrimary}>
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                Log in
              </Link>
              <Link href="/signup" className={btnPrimary + " text-sm"}>
                Get started
              </Link>
            </>
          )}
          <button className="md:hidden text-[#1A1A1A] p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#F7F4EC] border-t-2 border-[#1A1A1A] px-5 py-4 space-y-1">
          {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
               className="flex items-center justify-between font-kalam font-bold text-sm text-[#1A1A1A] py-2.5 px-3 rounded-[8px] hover:bg-[#FFE45E] border-2 border-transparent hover:border-[#1A1A1A] transition-all">
              {label}
              <span className="text-[#B8B5AA] text-xs">→</span>
            </a>
          ))}
          <div className="pt-3 border-t-2 border-[#EFEBE0] flex flex-col gap-2.5">
            {loggedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className={btnPrimary + " justify-center w-full"}>Dashboard →</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="font-kalam font-bold text-sm text-[#1A1A1A] bg-[#EFEBE0] border-2 border-[#1A1A1A] rounded-[10px] px-5 py-3 text-center shadow-brutal btn-press">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className={btnPrimary + " justify-center w-full"}>
                  Get 50 free leads →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Persona bar ──────────────────────────────────────────────────────────────

function PersonaBar({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  return (
    <div className="bg-[#EFEBE0] border-b-2 border-[#1A1A1A] px-6 md:px-12 py-3.5 overflow-x-auto">
      <div className="max-w-6xl mx-auto flex items-center gap-3 min-w-max md:min-w-0">
        <span className="font-jetbrains text-[12px] text-[#1A1A1A] whitespace-nowrap mr-1">I'M A →</span>
        {PERSONAS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActive(i)}
            className={
              active === i
                ? "font-kalam font-bold text-[14px] text-[#F7F4EC] bg-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-2 shadow-brutal btn-press cursor-pointer whitespace-nowrap"
                : "font-kalam font-bold text-[14px] text-[#1A1A1A] bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-4 py-2 cursor-pointer hover:bg-[#EFEBE0] transition-colors whitespace-nowrap"
            }
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Demo card (right side of hero) ──────────────────────────────────────────

function DemoCard({ persona }: { persona: Persona }) {
  return (
    <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg shadow-brutal-lg overflow-hidden">
      {/* Dark header bar */}
      <div className="bg-[#1A1A1A] px-4 py-2.5 flex items-center justify-between">
        <span className="font-jetbrains text-[11px] text-[#B8B5AA] uppercase tracking-wider">
          SAMPLE SEARCH · <span className="text-[#F7F4EC]">{persona.demoTag}</span>
        </span>
        <span className="font-jetbrains text-[11px] text-[#6FCF97] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FCF97] inline-block animate-pulse" />
          live
        </span>
      </div>

      {/* Search inputs */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b-2 border-[#1A1A1A]">
        <div className="flex items-center gap-2.5 bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2">
          <Search size={14} className="text-[#6B6B6B] flex-shrink-0" strokeWidth={2} />
          <span className="text-sm text-[#1A1A1A] truncate">{persona.demoKeyword}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-[10px] px-3 py-2">
          <MapPin size={14} className="text-[#6B6B6B] flex-shrink-0" strokeWidth={2} />
          <span className="text-sm text-[#1A1A1A] truncate">{persona.demoLocation}</span>
        </div>
      </div>

      {/* Results bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#EFEBE0]">
        <span className="font-jetbrains text-[12px] text-[#1A1A1A]">
          {persona.demoResults} results · {persona.demoTime}
        </span>
        <span className="font-jetbrains text-[12px] text-[#1A1A1A] bg-[#FFE45E] border border-[#1A1A1A] rounded px-2 py-0.5 flex items-center gap-1">
          <Download size={11} strokeWidth={2.5} />
          CSV
        </span>
      </div>

      {/* Lead rows */}
      {persona.demoLeads.map((lead, i) => (
        <div
          key={i}
          className={`px-4 py-2.5 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-3 items-center ${i < persona.demoLeads.length - 1 ? "border-b border-[#EFEBE0]" : ""}`}
        >
          <span className="text-[13px] font-bold text-[#1A1A1A] truncate">{lead.name}</span>
          <span className="font-jetbrains text-[12px] text-[#6B6B6B] whitespace-nowrap hidden sm:block">{lead.phone}</span>
          <span className="font-jetbrains text-[12px] font-bold text-[#1A1A1A] whitespace-nowrap">★ {lead.rating}</span>
        </div>
      ))}

      {/* Footer */}
      <div className="px-4 py-2.5 bg-[#EFEBE0] border-t border-[#1A1A1A]">
        <span className="font-jetbrains text-[11px] text-[#6B6B6B]">
          Showing {persona.demoLeads.length} of {persona.demoResults} results
        </span>
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ persona }: { persona: Persona }) {
  return (
    <section className="bg-[#F7F4EC] px-6 md:px-12 pt-12 pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── Left column ── */}
          <div className="max-w-xl">
            {/* Persona badge pill */}
            <div className="inline-flex items-center bg-[#FFE45E] border-[1.5px] border-[#1A1A1A] rounded-full px-3.5 py-1.5 mb-5">
              <span className="text-[13px] text-[#1A1A1A]">For&nbsp;</span>
              <span className="text-[13px] font-bold text-[#1A1A1A]">{persona.forLabel}</span>
            </div>

            {/* Headline */}
            <h1 className="font-kalam font-bold text-[#1A1A1A] text-[2.1rem] sm:text-[2.9rem] md:text-[3.6rem] leading-[1.1] tracking-tight mb-2">
              {persona.headline}
            </h1>
            <h1 className="font-kalam font-bold text-[#1A1A1A] text-[2.1rem] sm:text-[2.9rem] md:text-[3.6rem] leading-[1.1] tracking-tight mb-5 underline underline-offset-4 decoration-[#FFE45E] decoration-[5px] md:decoration-[6px]">
              {persona.headlineAccent}
            </h1>

            {/* Body */}
            <p className="text-[15px] md:text-[18px] text-[#3A3A3A] leading-relaxed mb-7">
              {persona.body}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/signup" className={btnPrimaryLg + " justify-center sm:justify-start"}>
                Get 50 free leads →
              </Link>
              <a href="#pricing" className={btnGhostLg + " justify-center sm:justify-start"}>
                View pricing →
              </a>
            </div>

            {/* Yellow stat box */}
            <div className="bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-organic-lg shadow-brutal p-5 mb-6">
              <div className="font-kalam font-bold text-[#1A1A1A] text-[3.25rem] leading-none mb-1">
                {persona.stat}
              </div>
              <div className="font-jetbrains text-[11px] text-[#1A1A1A] uppercase tracking-wider mb-1">
                {persona.statContext}
              </div>
              <div className="text-[16px] font-bold text-[#1A1A1A]">
                {persona.statLabel}
              </div>
            </div>

            {/* Testimonial */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EFEBE0] border-2 border-[#1A1A1A] flex items-center justify-center flex-shrink-0 font-kalam font-bold text-[#1A1A1A] text-sm">
                {persona.avatarInitials}
              </div>
              <div>
                <p className="text-[14px] text-[#3A3A3A] leading-relaxed mb-1.5">{persona.quote}</p>
                <span className="font-jetbrains text-[11px] text-[#6B6B6B]">{persona.attribution}</span>
              </div>
            </div>
          </div>

          {/* ── Right column — demo card ── */}
          <div className="w-full">
            <DemoCard persona={persona} />

            {/* Search → CSV stat below card */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-[2px] bg-[#1A1A1A]" />
              <span className="font-jetbrains text-[12px] text-[#1A1A1A] whitespace-nowrap uppercase tracking-wider px-1">
                FROM SEARCH → CSV · <span className="text-[#1A1A1A] font-bold">14 seconds</span>
              </span>
              <div className="flex-1 h-[2px] bg-[#1A1A1A]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Before / After ───────────────────────────────────────────────────────────

function BeforeAfter() {
  const before = [
    "Open Maps · scroll endlessly",
    "Copy/paste 47 names by hand",
    "Visit each site for the phone",
    "Hope the rating is recent",
    "2–4 hours per list",
  ]
  const after = [
    "Type keyword + city",
    "Get 47 verified businesses",
    "Phones, sites, ratings included",
    "Filter for quality leads",
    "30 seconds per list",
  ]

  return (
    <section id="how-it-works" className="bg-[#F7F4EC] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-20">
      <div className="max-w-6xl mx-auto">
        <span className="font-jetbrains text-[12px] text-[#6B6B6B] uppercase tracking-widest block mb-4">
          WHY SWITCH
        </span>
        <h2 className="font-kalam font-bold text-[#1A1A1A] text-[1.9rem] sm:text-[2.4rem] md:text-[3rem] leading-tight mb-10 md:mb-12">
          The old way vs.<br />LeadMapper.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg shadow-brutal-lg overflow-hidden">
            <div className="bg-[#FF6B5C] px-5 py-3 border-b-2 border-[#1A1A1A]">
              <span className="font-jetbrains text-[12px] font-bold text-[#F7F4EC] uppercase tracking-wider">
                BEFORE — MANUAL RESEARCH
              </span>
            </div>
            <ul className="p-5 space-y-3.5">
              {before.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-[#3A3A3A]">
                  <span className="w-5 h-5 rounded-full border-2 border-[#FF6B5C] flex items-center justify-center flex-shrink-0 text-[#FF6B5C] text-[11px] font-bold mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg shadow-brutal-lg overflow-hidden">
            <div className="bg-[#1A1A1A] px-5 py-3 border-b-2 border-[#1A1A1A]">
              <span className="font-jetbrains text-[12px] font-bold text-[#F7F4EC] uppercase tracking-wider">
                WITH LEADMAPPER
              </span>
            </div>
            <ul className="p-5 space-y-3.5">
              {after.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-[#1A1A1A]">
                  <span className="w-5 h-5 rounded-full border-2 border-[#1A1A1A] bg-[#FFE45E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} className="text-[#1A1A1A]" />
                  </span>
                  <span className="font-bold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: Search,
      title: "Keyword + location search",
      desc: "Any industry, any city worldwide. 200+ categories.",
      tag: null,
    },
    {
      icon: Star,
      title: "Verified business data",
      desc: "Name, phone, website, rating — pulled fresh per search.",
      tag: null,
    },
    {
      icon: Filter,
      title: "Smart filters",
      desc: "Rating, review count, has phone, has website.",
      tag: null,
    },
    {
      icon: Download,
      title: "One-click CSV export",
      desc: "Drop straight into your CRM or sequencer.",
      tag: "CSV",
    },
    {
      icon: History,
      title: "Search history",
      desc: "Every search saved — rerun in one click.",
      tag: null,
    },
    {
      icon: Clock,
      title: "Under 30 seconds",
      desc: "Up to 200 verified leads per search, always fresh.",
      tag: null,
    },
  ]

  return (
    <section id="features" className="bg-[#EFEBE0] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-20">
      <div className="max-w-6xl mx-auto">
        <span className="font-jetbrains text-[12px] text-[#6B6B6B] uppercase tracking-widest block mb-4">
          EVERYTHING YOU NEED
        </span>
        <h2 className="font-kalam font-bold text-[#1A1A1A] text-[1.9rem] sm:text-[2.4rem] md:text-[3rem] leading-tight mb-10 md:mb-12">
          The whole prospecting<br />workflow.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg p-5 shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-all duration-75"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon size={16} className="text-[#F7F4EC]" strokeWidth={1.75} />
                </div>
                {f.tag && (
                  <span className="font-jetbrains text-[11px] bg-[#FFE45E] border border-[#1A1A1A] rounded px-2 py-0.5">
                    {f.tag}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#1A1A1A] text-[15px] mb-1.5">{f.title}</h3>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: null,
      priceLabel: "Free",
      credits: "50 lifetime credits",
      popular: false,
      features: ["50 credits (lifetime)", "Phone & website filter", "CSV export", "Basic search"],
      cta: "Get free",
      href: "/signup",
    },
    {
      name: "Starter",
      price: 49,
      priceLabel: "$49",
      credits: "2,500 credits / mo",
      popular: false,
      features: ["2,500 credits/month", "Everything in Free", "Email support", "Bulk export"],
      cta: "Choose Starter",
      href: "/signup?plan=starter",
    },
    {
      name: "Growth",
      price: 89,
      priceLabel: "$89",
      credits: "5,000 credits / mo",
      popular: true,
      features: ["5,000 credits/month", "Bulk processing", "Priority support", "Unlimited saved searches"],
      cta: "Choose Growth",
      href: "/signup?plan=growth",
    },
  ]

  return (
    <section id="pricing" className="bg-[#F7F4EC] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-20">
      <div className="max-w-6xl mx-auto">
        <span className="font-jetbrains text-[12px] text-[#6B6B6B] uppercase tracking-widest block mb-4">
          PRICING
        </span>
        <h2 className="font-kalam font-bold text-[#1A1A1A] text-[1.9rem] sm:text-[2.4rem] md:text-[3rem] leading-tight mb-10 md:mb-12">
          Start free. Upgrade<br />when you ship.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-[#F7F4EC] border-2 border-[#1A1A1A] rounded-organic-lg p-6 flex flex-col shadow-brutal-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="font-kalam font-bold text-[13px] text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#1A1A1A] rounded-full px-3 py-1 whitespace-nowrap shadow-brutal">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="font-jetbrains text-[12px] text-[#6B6B6B] uppercase tracking-wider mb-2">
                  {plan.name}
                </div>
                <div className="font-kalam font-bold text-[#1A1A1A] text-[2.4rem] leading-none mb-1">
                  {plan.priceLabel}
                  {plan.price && <span className="font-kalam text-[1rem] text-[#6B6B6B] ml-1">/mo</span>}
                </div>
                <div className="font-jetbrains text-[12px] text-[#6B6B6B]">{plan.credits}</div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#3A3A3A]">
                    <span className="w-4.5 h-4.5 rounded-sm border-2 border-[#1A1A1A] bg-[#FFE45E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} strokeWidth={3} className="text-[#1A1A1A]" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={
                  plan.popular
                    ? btnPrimary + " w-full justify-center"
                    : btnGhost  + " w-full justify-center"
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 font-jetbrains text-[12px] text-[#6B6B6B]">
          No credit card to start free · Cancel anytime · Instant access
        </p>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: "What data does LeadMapper provide?",  a: "Business name, phone number, website URL, Google Maps link, star rating, and review count — all pulled fresh per search." },
    { q: "How do credits work?",                a: "Each business returned costs 1 credit. Exporting to CSV is always free — no extra charges." },
    { q: "Can I export to CSV?",                a: "Yes. One-click CSV and Excel exports, ready for any CRM or cold outreach tool. Instant download." },
    { q: "Is there a free plan?",               a: "Yes — 50 free lifetime credits, no credit card required. Enough to find your first batch of leads." },
    { q: "What countries are supported?",       a: "50+ countries. If a business is on Google Maps, LeadMapper can find it." },
    { q: "Is the data accurate?",               a: "Data is pulled from Google Maps in real time. Phones and websites match what businesses list publicly." },
  ]

  return (
    <section id="faq" className="bg-[#EFEBE0] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-20">
      <div className="max-w-2xl mx-auto">
        <span className="font-jetbrains text-[12px] text-[#6B6B6B] uppercase tracking-widest block mb-4">FAQ</span>
        <h2 className="font-kalam font-bold text-[#1A1A1A] text-[1.9rem] sm:text-[2.4rem] md:text-[3rem] leading-tight mb-10">
          Common questions.
        </h2>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b-2 border-[#1A1A1A]">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 cursor-pointer"
              >
                <span className="font-bold text-[#1A1A1A] text-[15px]">{faq.q}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`text-[#6B6B6B] flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="pb-5">
                  <p className="text-[14px] text-[#3A3A3A] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-[#1A1A1A] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-kalam font-bold text-[#F7F4EC] text-[2rem] sm:text-[2.6rem] md:text-[3.4rem] leading-tight mb-5">
          Whatever you sell,<br />find buyers faster.
        </h2>
        <p className="text-[#B8B5AA] text-[16px] mb-10 leading-relaxed">
          50 free leads · no credit card · works for
          <br className="hidden sm:block" />
          {PERSONAS.map((p, i) => (
            <span key={p.id}>
              {i > 0 && <span className="text-[#6B6B6B]"> , </span>}
              <span className="text-[#EFEBE0]">{p.label}</span>
            </span>
          ))}
        </p>

        <Link
          href="/signup"
          className="font-kalam font-bold text-[#1A1A1A] bg-[#FFE45E] border-2 border-[#F7F4EC] rounded-organic-lg px-8 py-4 text-[1.1rem] inline-flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#F7F4EC] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#F7F4EC] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-75"
        >
          Get 50 free leads →
        </Link>

        <p className="font-jetbrains text-[11px] text-[#6B6B6B] mt-5 uppercase tracking-wider">
          No credit card · Cancel anytime · Instant access
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#F7F4EC] border-t-2 border-[#1A1A1A] px-6 md:px-12 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center">
                <Search size={14} color="#F7F4EC" strokeWidth={2.5} />
              </div>
              <span className="font-kalam font-bold text-[#1A1A1A] text-[1.2rem]">LeadMapper</span>
            </div>
            <p className="text-[14px] text-[#6B6B6B] leading-relaxed max-w-xs">
              The fastest way to find verified local business leads. Built for agencies, SDRs, and growth teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="font-jetbrains text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-4">PRODUCT</div>
            <ul className="space-y-2.5">
              {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"],["Dashboard","/dashboard"]].map(([label, href]) => (
                <li key={label}><a href={href} className="text-[14px] text-[#3A3A3A] hover:text-[#1A1A1A] transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <div className="font-jetbrains text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-4">ACCOUNT</div>
            <ul className="space-y-2.5">
              {[["Log in","/login"],["Sign up","/signup"],["Billing","/dashboard/billing"]].map(([label, href]) => (
                <li key={label}><Link href={href} className="text-[14px] text-[#3A3A3A] hover:text-[#1A1A1A] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="font-jetbrains text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-4">LEGAL</div>
            <ul className="space-y-2.5">
              {[["Privacy Policy","/privacy"],["Terms of Service","/terms"],["Contact","/contact"]].map(([label, href]) => (
                <li key={label}><Link href={href} className="text-[14px] text-[#3A3A3A] hover:text-[#1A1A1A] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#1A1A1A] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-jetbrains text-[12px] text-[#6B6B6B]">© {new Date().getFullYear()} LeadMapper. All rights reserved.</p>
          <p className="font-jetbrains text-[11px] text-[#B8B5AA]">Find local business leads instantly.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activePersona, setActivePersona] = useState(0)
  const persona = PERSONAS[activePersona]

  return (
    <div className="min-h-screen bg-[#F7F4EC]">
      <Navbar />
      <PersonaBar active={activePersona} setActive={setActivePersona} />
      <Hero persona={persona} />
      <BeforeAfter />
      <Features />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}
