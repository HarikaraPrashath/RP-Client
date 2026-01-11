"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { VideoRecorderWithQuestions } from "@/components/video-recorder-with-questions"
import { getRandomQuestions } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function page() {
  const router = useRouter()
  const [questions] = useState(() => getRandomQuestions(10))

  const handleComplete = (recordedChunks: Blob[]) => {
    // In a real app, you would upload the video and process it
    console.log("[v0] Recording complete:", recordedChunks.length, "chunks")

    // Simulate processing and redirect to results
    setTimeout(() => {
      router.push("/personality-prediction/results")
    }, 1000)
  }

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
          <h1 className="mb-2 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Career Personality Analysis
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Answer the following questions while we analyze your facial expressions to determine your personality
            traits.
          </p>
        </div>

        {/* Video Recorder Component */}
        <div className="mx-auto max-w-4xl">
          <VideoRecorderWithQuestions questions={questions} onComplete={handleComplete} />
        </div>
      </div>
    </div>
  )
}
