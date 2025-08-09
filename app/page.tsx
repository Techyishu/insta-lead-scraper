import { Card, CardContent } from "@/components/ui/card"
import LeadScraper from "@/components/lead-scraper"

export default async function Page() {
  const hasToken = Boolean(process.env.APIFY_API_TOKEN)

  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Lead Scraper - Find Instagram Leads</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter who you&apos;re looking for and a location. We&apos;ll search Google for Instagram profiles.
          </p>
        </header>

        <Card className="border-border/60">
          <CardContent className="p-4 sm:p-6">
            <LeadScraper envHasToken={hasToken} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
