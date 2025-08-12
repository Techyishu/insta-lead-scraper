import { Card, CardContent } from "@/components/ui/card"
import LeadScraper from "@/components/lead-scraper"

export default function Page() {
  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Lead Scraper - Find Instagram Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-2 px-4 sm:px-0">
            Enter who you&apos;re looking for and a location. We&apos;ll search Google for Instagram profiles.
          </p>
        </header>

        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <LeadScraper />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
