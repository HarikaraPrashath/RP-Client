"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmotionData } from "@/lib/mock-data"

interface EmotionTimelineProps {
  emotions: EmotionData[]
}

export function EmotionTimeline({ emotions }: EmotionTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; index: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.parentElement?.clientWidth || 800
    const displayHeight = 350

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    ctx.scale(dpr, dpr)

    const padding = { top: 40, right: 60, bottom: 60, left: 70 }
    const chartWidth = displayWidth - padding.left - padding.right
    const chartHeight = displayHeight - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // Draw axes
    ctx.strokeStyle = "rgba(15, 23, 42, 0.4)" // darker axis color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, displayHeight - padding.bottom)
    ctx.lineTo(displayWidth - padding.right, displayHeight - padding.bottom)
    ctx.stroke()

    // Draw grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"
    ctx.lineWidth = 1
    for (let i = 1; i < emotions.length; i++) {
      const x = padding.left + (chartWidth / (emotions.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, displayHeight - padding.bottom)
      ctx.stroke()
    }

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(displayWidth - padding.right, y)
      ctx.stroke()
    }

    const points = emotions.map((emotion, index) => ({
      x: padding.left + (chartWidth / (emotions.length - 1)) * index,
      y: displayHeight - padding.bottom - emotion.intensity * chartHeight,
      ...emotion,
    }))

    // Draw area gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, displayHeight - padding.bottom)
    gradient.addColorStop(0, "rgba(37, 99, 235, 0.2)")
    gradient.addColorStop(1, "rgba(37, 99, 235, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(points[0].x, displayHeight - padding.bottom)
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.lineTo(points[points.length - 1].x, displayHeight - padding.bottom)
    ctx.closePath()
    ctx.fill()

    // Draw line
    ctx.strokeStyle = "rgba(29, 78, 216, 1)" // deeper blue line
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()

    // Draw points
    points.forEach((point, index) => {
      const isHovered = hoveredPoint?.index === index
      ctx.fillStyle = isHovered ? "rgba(29, 78, 216, 1)" : "white"
      ctx.strokeStyle = "rgba(29, 78, 216, 1)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(point.x, point.y, isHovered ? 7 : 5, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })

    // Draw Labels
    ctx.fillStyle = "rgba(15, 23, 42, 1)" // black labels for clarity
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "center"
    points.forEach((point) => {
      ctx.fillText(point.time, point.x, displayHeight - padding.bottom + 25)
    })

    // Draw Y-axis Intensity labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * (4 - i)
      const value = i * 25 + "%"
      ctx.fillText(value, padding.left - 15, y)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let found = null
      points.forEach((point, index) => {
        const dist = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2))
        if (dist < 15) {
          found = { x: point.x, y: point.y, index }
        }
      })
      setHoveredPoint(found)
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    return () => canvas.removeEventListener("mousemove", handleMouseMove)
  }, [emotions, hoveredPoint])

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>Emotion Timeline</CardTitle>
        <CardDescription>Visual mapping of emotional intensity detected during the analysis</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <canvas ref={canvasRef} className="cursor-crosshair" />

        {hoveredPoint !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border bg-background p-2 text-xs shadow-lg ring-1 ring-black/5"
            style={{
              left: hoveredPoint.x + 20,
              top: hoveredPoint.y - 40,
              transform: "translateY(-50%)",
            }}
          >
            <p className="font-bold text-blue-600">{emotions[hoveredPoint.index].emotion}</p>
            <p className="text-muted-foreground">
              {emotions[hoveredPoint.index].time} • {Math.round(emotions[hoveredPoint.index].intensity * 100)}%
              Intensity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
