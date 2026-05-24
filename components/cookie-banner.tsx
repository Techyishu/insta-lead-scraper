"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-xl shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-neutral-600 flex-1 leading-relaxed">
          We use essential cookies for authentication and session management.{" "}
          <Link href="/privacy" className="text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium">
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
