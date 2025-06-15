import { getDrones, getOrganizationStats } from "@/lib/actions"
import { DroneFleetTable } from "@/components/drone-fleet-table"
import { AddDroneForm } from "@/components/add-drone-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Battery, AlertTriangle, Wrench } from "lucide-react"
import { getDatabase } from "@/lib/mongodb"

export default async function FleetPage() {
  const [drones, stats] = await Promise.all([getDrones(), getOrganizationStats()])

  // Get organization ID
  let organizationId = "507f1f77bcf86cd799439011"
  try {
    const db = await getDatabase()
    const org = await db.collection("organizations").findOne({})
    if (org) {
      organizationId = org._id.toString()
    }
  } catch (error) {
    console.error("Error fetching organization:", error)
  }

  const fleetStats = {
    total: drones.length,
    available: drones.filter((d: any) => d.status === "available").length,
    inMission: drones.filter((d: any) => d.status === "in_mission").length,
    maintenance: drones.filter((d: any) => d.status === "maintenance").length,
    charging: drones.filter((d: any) => d.status === "charging").length,
    avgBattery: Math.round(drones.reduce((acc: number, d: any) => acc + d.battery_level, 0) / drones.length),
    lowBattery: drones.filter((d: any) => d.battery_level < 30).length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <p className="text-gray-600">Monitor and manage your drone fleet</p>
      </div>

      <AddDroneForm organizationId={organizationId} />

      {/* Enhanced Fleet Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                {fleetStats.available} Available
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                {fleetStats.inMission} Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.avgBattery}%</div>
            <div className="flex items-center gap-2 mt-2">
              {fleetStats.lowBattery > 0 && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                  {fleetStats.lowBattery} Low Battery
                </Badge>
              )}
              {fleetStats.lowBattery === 0 && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">All Good</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fleetStats.maintenance}</div>
            <div className="flex items-center gap-1 mt-2">
              {fleetStats.maintenance > 0 && <AlertTriangle className="h-3 w-3 text-red-500" />}
              <span className="text-xs text-muted-foreground">
                {fleetStats.maintenance > 0 ? "Needs attention" : "All operational"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charging</CardTitle>
            <Battery className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{fleetStats.charging}</div>
            <p className="text-xs text-muted-foreground">Currently charging</p>
          </CardContent>
        </Card>
      </div>

      <DroneFleetTable drones={drones} />
    </div>
  )
}
