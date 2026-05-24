"use client"

import Link from "next/link"
import { Bookmark, Search, ArrowRight, Plus, RefreshCw, MapPin } from "lucide-react"

export default function SavedLeadsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">Saved Searches</h1>
          <p className="text-neutral-400 text-sm">Save searches to rerun them anytime without re-entering details.</p>
        </div>
        <Link
          href="/dashboard/new-search"
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={13} strokeWidth={2.5} />
          New Search
        </Link>
      </div>

      {/* Empty state */}
      <div className="bg-white border border-neutral-200 rounded-xl p-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Bookmark size={22} className="text-neutral-300" strokeWidth={2} />
        </div>
        <h2 className="text-base font-semibold text-neutral-900 mb-2">No saved searches yet</h2>
        <p className="text-sm text-neutral-400 mb-6 max-w-xs mx-auto">
          After running a search, you can save it here to rerun it instantly next time.
        </p>
        <Link
          href="/dashboard/new-search"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Search size={14} strokeWidth={2} />
          Run your first search
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* How it works hint */}
      <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">How saved searches work</p>
        <ul className="space-y-2.5 text-xs text-neutral-500">
          {[
            { icon: Search, text: "Run any search from the New Search page" },
            { icon: Bookmark, text: 'Click "Save search" to bookmark it with a custom name' },
            { icon: RefreshCw, text: "Rerun saved searches anytime with one click" },
            { icon: MapPin, text: "Duplicate searches to test different locations instantly" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2">
              <Icon size={12} className="mt-0.5 text-neutral-300 flex-shrink-0" strokeWidth={2} />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
