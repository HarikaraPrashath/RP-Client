"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PersonalityScores } from "@/lib/mock-data"
import { personalityTraitDescriptions } from "@/lib/mock-data"

interface PersonalityRadarChartProps {
  scores: PersonalityScores
}

export function PersonalityRadarChart({ scores }: PersonalityRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const containerWidth = canvas.parentElement?.clientWidth || 500
    const size = Math.min(containerWidth, 500)

    // Support high-resolution displays (Retina)
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 100

    // Traits in order for radar chart
    const traits: (keyof PersonalityScores)[] = [
      "openness",
      "conscientiousness",
      "extraversion",
      "agreeableness",
      "neuroticism",
    ]
    const traitLabels: Record<keyof PersonalityScores, string> = {
      openness: "Openness",
      conscientiousness: "Conscientiousness",
      extraversion: "Extraversion",
      agreeableness: "Agreeableness",
      neuroticism: "Emotional Stability",
    }
    const angles = traits.map((_, i) => (i * 2 * Math.PI) / traits.length - Math.PI / 2)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let foundPoint = false

      angles.forEach((angle, i) => {
        const trait = traits[i]
        const value = scores[trait]
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)

        // Check if mouse is near this point (within 10 pixels)
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
        if (dist < 10) {
          setTooltip({
            x,
            y: y - 10,
            label: traitLabels[trait],
            value: `${Math.round(value * 100)}%`,
          })
          foundPoint = true
        }
      })

      if (!foundPoint) {
        setTooltip(null)
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", () => setTooltip(null))

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      ctx.strokeStyle = "#94A3B8"
      ctx.lineWidth = 1
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        const r = (radius * i) / 5
        angles.forEach((angle, j) => {
          const x = centerX + r * Math.cos(angle)
          const y = centerY + r * Math.sin(angle)
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.stroke()
      }

      // Draw axis lines
      ctx.strokeStyle = "#CBD5E1"
      angles.forEach((angle) => {
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        ctx.lineTo(x, y)
        ctx.stroke()
      })

      // Draw personality data
      ctx.fillStyle = "rgba(147, 197, 253, 0.45)" // Slightly deeper fill
      ctx.strokeStyle = "#2563EB" // Darker blue for clarity
      ctx.lineWidth = 3 // Bolder line
      ctx.setLineDash([])

      ctx.beginPath()
      angles.forEach((angle, i) => {
        const trait = traits[i]
        const value = scores[trait]
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw points
      angles.forEach((angle, i) => {
        const trait = traits[i]
        const value = scores[trait]
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)

        ctx.fillStyle = "white"
        ctx.strokeStyle = "#2563EB"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI) // Larger points
        ctx.fill()
        ctx.stroke()
      })

      ctx.fillStyle = "#0F172A"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      angles.forEach((angle, i) => {
        const trait = traits[i]
        const label = traitLabels[trait]
        const labelOffset = 35 // More offset to prevent overlapping
        const x = centerX + (radius + labelOffset) * Math.cos(angle)
        const y = centerY + (radius + labelOffset) * Math.sin(angle)

        // Adjust text alignment based on position
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        if (Math.abs(cos) < 0.3) {
          ctx.textAlign = "center"
        } else if (cos > 0) {
          ctx.textAlign = "left"
        } else {
          ctx.textAlign = "right"
        }

        if (label === "Conscientiousness") {
          // Split the long word manually for better fit
          ctx.fillText("Conscien-", x, y - 8)
          ctx.fillText("tiousness", x, y + 8)
        } else if (label.includes(" ")) {
          const parts = label.split(" ")
          ctx.fillText(parts[0], x, y - 8)
          ctx.fillText(parts[1], x, y + 8)
        } else {
          ctx.fillText(label, x, y)
        }
      })
    }

    render()

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [scores])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personality Profile</CardTitle>
        <CardDescription>Based on the Big Five personality model</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <canvas ref={canvasRef} className="max-w-full cursor-crosshair" />
            {tooltip && (
              <div
                className="pointer-events-none absolute z-10 rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {tooltip.label}: {tooltip.value}
                <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>
          <div className="w-full space-y-3">
            {Object.entries(scores).map(([trait, score]) => {
              const info = personalityTraitDescriptions[trait as keyof PersonalityScores]
              return (
                <div key={trait} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{info.name}</span>
                    <span className="text-muted-foreground">{Math.round(score * 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${score * 100}%` }}
                      aria-label={`${info.name} score: ${Math.round(score * 100)}%`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
