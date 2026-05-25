import { Suspense } from "react"
import GoogleMapsScraper from "@/components/google-maps-scraper"

export default function NewSearchPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="font-kalam font-bold text-2xl text-[#1A1A1A] mb-1">New search</h2>
        <p className="font-jetbrains text-[12px] text-[#6B6B6B]">
          Search uses 1 credit per result returned (max 200)
        </p>
      </div>
      <Suspense>
        <GoogleMapsScraper />
      </Suspense>
    </div>
  )
}
