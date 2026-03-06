import "./polyfills/fixRepeat.server"
import type React from "react"

export default function CareerMarketLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}