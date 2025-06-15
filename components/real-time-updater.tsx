"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RealTimeUpdater() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Trigger server-side simulation
        await fetch("/api/simulate-progress", { method: "POST" })

        // Refresh the page data
        router.refresh()
      } catch (error) {
        console.error("Error updating real-time data:", error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [router])

  return null
}
