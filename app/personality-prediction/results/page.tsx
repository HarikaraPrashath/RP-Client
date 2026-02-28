import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PersonalityRadarChart } from "@/components/personality-radar-chart"
import { CareerMatchCard } from "@/components/career-match-card"
import { EmotionTimeline } from "@/components/emotion-timeline"
import { mockPersonality, mockCareers, mockEmotions } from "@/lib/mock-data"
import { Download, Share2, RotateCw, ArrowLeft } from "lucide-react"

export default function page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="mb-2 text-balance text-3xl font-bold text-foreground md:text-4xl">Your Career Analysis</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Based on your responses and facial expression analysis, here are your personalized results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
          <Button asChild variant="outline">
            <Link href="/analyze">
              <RotateCw className="mr-2 h-4 w-4" />
              Retake Analysis
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          {/* Personality Chart */}
          <PersonalityRadarChart scores={mockPersonality} />

          {/* Career Matches */}
          <section>
            <h2 className="mb-4 text-balance text-2xl font-bold text-foreground">Top Career Matches</h2>
            <p className="mb-6 text-pretty text-muted-foreground">
              Based on your personality profile, these IT careers are the best fit for you.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              {mockCareers.map((career, index) => (
                <CareerMatchCard key={index} career={career} rank={index + 1} />
              ))}
            </div>
          </section>

          {/* Emotion Timeline */}
          <EmotionTimeline emotions={mockEmotions} />

          {/* Next Steps */}
          <section className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold">What's Next?</h2>
            <div className="space-y-3 text-pretty leading-relaxed text-blue-50">
              <p>Now that you know your personality profile and ideal career matches, consider these next steps:</p>
              <ul className="ml-4 space-y-2">
                <li>• Research the recommended careers to learn more about day-to-day responsibilities</li>
                <li>• Identify skill gaps and create a learning plan</li>
                <li>• Connect with professionals in these fields on LinkedIn</li>
                <li>• Update your resume to highlight relevant personality strengths</li>
                <li>• Consider taking specialized courses or certifications</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/analyze">Take Another Assessment</Link>
              </Button>
              <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white/10">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
