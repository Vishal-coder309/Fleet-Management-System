import { getDrones, getMissions } from "@/lib/actions"
import { EnhancedMissionPlanning } from "@/components/enhanced-mission-planning"
import { ActiveMissionsTable } from "@/components/active-missions-table"
import { getDatabase } from "@/lib/mongodb"

export default async function MissionsPage() {
  const [drones, missions] = await Promise.all([getDrones(), getMissions()])

  // Get the first organization ID from the database
  let organizationId = "507f1f77bcf86cd799439011" // fallback
  try {
    const db = await getDatabase()
    const org = await db.collection("organizations").findOne({})
    if (org) {
      organizationId = org._id.toString()
    }
  } catch (error) {
    console.error("Error fetching organization:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Mission Planning</h1>
        <p className="text-gray-600">Plan and configure comprehensive drone missions with advanced features</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <EnhancedMissionPlanning drones={drones} organizationId={organizationId} />
        <ActiveMissionsTable missions={missions} />
      </div>
    </div>
  )
}
