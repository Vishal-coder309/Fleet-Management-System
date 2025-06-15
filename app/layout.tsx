import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { RealTimeUpdater } from "@/components/real-time-updater"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DroneOps - Drone Survey Management System",
  description: "Comprehensive drone fleet management and mission planning platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="lg:pl-64">
            <div className="px-4 py-8 lg:px-8">{children}</div>
          </main>
          <RealTimeUpdater />
        </div>
      </body>
    </html>
  )
}
