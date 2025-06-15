import { simulateMissionProgress } from "@/lib/actions"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await simulateMissionProgress()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error simulating progress:", error)
    return NextResponse.json({ error: "Failed to simulate progress" }, { status: 500 })
  }
}
