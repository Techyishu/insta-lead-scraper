"use client"

import { useState, Suspense } from "react"
import GoogleMapsScraper from "@/components/google-maps-scraper"
import B2BLeadsFinder from "@/components/b2b-leads-finder"

type Mode = "local" | "b2b"

export default function NewSearchPage() {
  const [mode, setMode] = useState<Mode>("local")

  return (
    <div className="max-w-5xl mx-auto">

      {/* Mode selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">

        {/* Mode 1 */}
        <button
          type="button"
          onClick={() => setMode("local")}
          className={`text-left border-2 rounded-[14px] px-5 py-4 transition-all ${
            mode === "local"
              ? "bg-[#FFE45E] border-[#1A1A1A] shadow-brutal"
              : "bg-[#F7F4EC] border-[#1A1A1A] hover:bg-[#EFEBE0]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-8 h-8 rounded-[8px] border-2 border-[#1A1A1A] flex items-center justify-center flex-shrink-0 ${mode === "local" ? "bg-[#1A1A1A]" : "bg-[#EFEBE0]"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={mode === "local" ? "#FFE45E" : "#6B6B6B"} strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="6"/><path d="M16 16 L21 21"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-jetbrains text-[9px] font-bold text-[#6B6B6B] uppercase tracking-widest">Mode 1</span>
                {mode === "local" && <span className="font-jetbrains text-[9px] font-bold bg-[#1A1A1A] text-[#FFE45E] rounded-[4px] px-1.5 py-0.5">ACTIVE</span>}
              </div>
              <p className="font-kalam font-bold text-[#1A1A1A] text-base leading-tight mb-1">Local Business Search</p>
              <p className="font-jetbrains text-[10px] text-[#6B6B6B] leading-relaxed">
                Find local businesses by city &amp; niche
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Restaurants", "Dentists", "Agencies", "Plumbers"].map((t) => (
                  <span key={t} className="font-jetbrains text-[9px] text-[#6B6B6B] bg-[#1A1A1A]/10 border border-[#1A1A1A]/20 rounded-[4px] px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </button>

        {/* Mode 2 */}
        <button
          type="button"
          onClick={() => setMode("b2b")}
          className={`text-left border-2 rounded-[14px] px-5 py-4 transition-all ${
            mode === "b2b"
              ? "bg-[#FFE45E] border-[#1A1A1A] shadow-brutal"
              : "bg-[#F7F4EC] border-[#1A1A1A] hover:bg-[#EFEBE0]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-8 h-8 rounded-[8px] border-2 border-[#1A1A1A] flex items-center justify-center flex-shrink-0 ${mode === "b2b" ? "bg-[#1A1A1A]" : "bg-[#EFEBE0]"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={mode === "b2b" ? "#FFE45E" : "#6B6B6B"} strokeWidth="2.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-jetbrains text-[9px] font-bold text-[#6B6B6B] uppercase tracking-widest">Mode 2</span>
                {mode === "b2b" && <span className="font-jetbrains text-[9px] font-bold bg-[#1A1A1A] text-[#FFE45E] rounded-[4px] px-1.5 py-0.5">ACTIVE</span>}
                <span className="font-jetbrains text-[9px] font-bold bg-[#FF6B5C] text-[#F7F4EC] border border-[#1A1A1A] rounded-[4px] px-1.5 py-0.5">NEW</span>
              </div>
              <p className="font-kalam font-bold text-[#1A1A1A] text-base leading-tight mb-1">B2B Contact Search</p>
              <p className="font-jetbrains text-[10px] text-[#6B6B6B] leading-relaxed">
                Find decision makers at any company
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Verified Email", "LinkedIn", "Mobile", "Company Intel"].map((t) => (
                  <span key={t} className="font-jetbrains text-[9px] text-[#6B6B6B] bg-[#1A1A1A]/10 border border-[#1A1A1A]/20 rounded-[4px] px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </button>

      </div>

      {/* Sub-heading */}
      <div className="mb-5">
        {mode === "local" ? (
          <>
            <h2 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-0.5">Local business search</h2>
            <p className="font-jetbrains text-[11px] text-[#6B6B6B]">1 credit per result · max {200} per search</p>
          </>
        ) : (
          <>
            <h2 className="font-kalam font-bold text-xl text-[#1A1A1A] mb-0.5">B2B contact search</h2>
            <p className="font-jetbrains text-[11px] text-[#6B6B6B]">1 credit per contact · verified emails, LinkedIn &amp; mobile numbers</p>
          </>
        )}
      </div>

      {/* Active mode component */}
      <Suspense>
        {mode === "local" ? <GoogleMapsScraper /> : <B2BLeadsFinder />}
      </Suspense>

    </div>
  )
}
