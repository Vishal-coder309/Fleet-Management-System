"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Zap, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface AdvancedAnalyticsProps {
  stats: {
    totalDrones: number
    activeMissions: number
    completedMissions: number
    totalFlightTime: number
    missionsByType: Record<string, number>
    dronesByStatus: Record<string, number>
  }
  missions: any[]
  drones: any[]
}

export function AdvancedAnalytics({ stats, missions, drones }: AdvancedAnalyticsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Calculate efficiency metrics
  const avgMissionDuration =
    missions.length > 0 ? missions.reduce((acc, m) => acc + (m.elapsed_time || 0), 0) / missions.length : 0

  const successRate =
    missions.length > 0 ? (missions.filter((m) => m.status === "completed").length / missions.length) * 100 : 0

  const avgBatteryLevel = drones.length > 0 ? drones.reduce((acc, d) => acc + d.battery_level, 0) / drones.length : 0

  const dronesNeedingMaintenance = drones.filter((d) => d.status === "maintenance").length

  // Recent mission trends
  const recentMissions = missions
    .filter((m) => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mission Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mission Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgMissionDuration)}</div>
            <p className="text-xs text-muted-foreground">Per mission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Battery Avg</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBatteryLevel.toFixed(0)}%</div>
            <Progress value={avgBatteryLevel} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dronesNeedingMaintenance}</div>
            <p className="text-xs text-muted-foreground">Drones need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mission Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mission Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.missionsByType).map(([type, count]) => {
                const percentage = (count / Object.values(stats.missionsByType).reduce((a, b) => a + b, 0)) * 100
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.dronesByStatus).map(([status, count]) => {
                const percentage = (count / stats.totalDrones) * 100
                const statusColors = {
                  available: "bg-green-500",
                  in_mission: "bg-blue-500",
                  maintenance: "bg-red-500",
                  charging: "bg-yellow-500",
                }
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors] || "bg-gray-500"}`}
                        />
                        <span className="capitalize text-sm font-medium">{status.replace("_", " ")}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Mission Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMissions.slice(0, 5).map((mission) => (
              <div key={mission._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{mission.name}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Drone: {mission.drone?.name}</span>
                    <span>Type: {mission.mission_type}</span>
                    <span>Duration: {formatTime(mission.elapsed_time || 0)}</span>
                  </div>
                </div>
                <Badge
                  className={
                    mission.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : mission.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : mission.status === "aborted"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }
                >
                  {mission.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Efficiency</h4>
              <p className="text-sm text-blue-700 mt-1">
                {successRate > 90 ? "Excellent" : successRate > 75 ? "Good" : "Needs Improvement"} mission success rate
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Fleet Health</h4>
              <p className="text-sm text-green-700 mt-1">
                {avgBatteryLevel > 70 ? "Healthy" : avgBatteryLevel > 50 ? "Fair" : "Low"} average battery level
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900">Utilization</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {((stats.activeMissions / stats.totalDrones) * 100).toFixed(0)}% of fleet currently active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
