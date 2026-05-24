import GoogleMapsScraper from "@/components/google-maps-scraper"

export default function NewSearchPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-1">New Search</h1>
        <p className="text-neutral-400 text-sm">Search local businesses by keyword and location. Export results as CSV.</p>
      </div>
      <GoogleMapsScraper />
    </div>
  )
}
