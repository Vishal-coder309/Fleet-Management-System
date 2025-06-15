import { getDrones, getMissions, getOrganizationStats } from "@/lib/actions"
import { DashboardStats } from "@/components/dashboard-stats"
import { DroneFleetTable } from "@/components/drone-fleet-table"
import { ActiveMissionsTable } from "@/components/active-missions-table"
import { AdvancedAnalytics } from "@/components/advanced-analytics"

export default async function DashboardPage() {
  const [drones, missions, stats] = await Promise.all([getDrones(), getMissions(), getOrganizationStats()])

  const activeMissions = missions.filter((m: any) => ["planned", "in_progress", "paused"].includes(m.status))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your drone fleet and operations</p>
      </div>

      <DashboardStats stats={stats} />

      <AdvancedAnalytics stats={stats} missions={missions} drones={drones} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DroneFleetTable drones={drones} />
        <ActiveMissionsTable missions={activeMissions} />
      </div>
    </div>
  )
}
