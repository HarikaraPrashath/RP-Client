"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react"
import type { CareerMatch } from "@/lib/mock-data"

interface CareerMatchCardProps {
  career: CareerMatch
  rank: number
}

export function CareerMatchCard({ career, rank }: CareerMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const matchPercentage = Math.round(career.match * 100)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                #{rank}
              </div>
              <CardTitle className="text-xl">{career.title}</CardTitle>
            </div>
            <CardDescription className="text-base">{career.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Career Match
            </span>
            <span className="text-2xl font-bold text-blue-600">{matchPercentage}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
              style={{ width: `${matchPercentage}%` }}
              aria-label={`${matchPercentage}% match`}
            />
          </div>
        </div>

        {/* Salary Range */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">Expected Salary Range</p>
          <p className="text-lg font-semibold text-foreground">{career.salary}</p>
        </div>

        {/* Skills */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {career.skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="space-y-3 border-t pt-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Why This Career Fits You</h4>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{career.whyItFits}</p>
            </div>
          </div>
        )}

        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="w-full"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show More Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
