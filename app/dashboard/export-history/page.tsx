"use client"

import Link from "next/link"
import { Download, Search, ArrowRight } from "lucide-react"

export default function ExportHistoryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Export History</h1>
        <p className="text-neutral-400 text-sm">All your past CSV exports in one place. Re-download anytime.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
        {[
          { label: "Total exports", value: "0" },
          { label: "Total leads exported", value: "0" },
          { label: "Credits used", value: "0" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 text-center">
            <div className="font-display font-bold text-2xl text-neutral-900 mb-0.5">{s.value}</div>
            <div className="text-[11px] text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-white border border-neutral-200 rounded-xl p-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Download size={22} className="text-neutral-300" strokeWidth={2} />
        </div>
        <h2 className="text-base font-semibold text-neutral-900 mb-2">No exports yet</h2>
        <p className="text-sm text-neutral-400 mb-6 max-w-xs mx-auto">
          Run a search and export the results to CSV or Excel. All exports appear here for easy re-download.
        </p>
        <Link
          href="/dashboard/new-search"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Search size={14} strokeWidth={2} />
          Find leads to export
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Export formats */}
      <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Export formats supported</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { format: "CSV (.csv)", desc: "Compatible with Excel, Google Sheets, and all CRMs." },
            { format: "Excel (.xlsx)", desc: "Native Excel format with formatted columns." },
          ].map((f) => (
            <div key={f.format} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-neutral-700 mb-0.5">{f.format}</div>
              <div className="text-[11px] text-neutral-400">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
