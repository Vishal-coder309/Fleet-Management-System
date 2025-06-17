"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Navigation, Clock, Battery } from "lucide-react"
import type { Mission, Drone } from "@/lib/types"

interface MissionMonitoringMapProps {
  missions: (Mission & { drone: Drone })[]
}

export function MissionMonitoringMap({ missions }: MissionMonitoringMapProps) {
  const activeMissions = missions.filter((m) => m.status === "in_progress")

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mission Monitoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Placeholder */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Live Flight Tracking</h3>
              <div className="bg-slate-100 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
                <div className="space-y-4">
                  <MapPin className="h-12 w-12 mx-auto text-slate-400" />
                  <div className="space-y-2">
                    <p className="text-slate-600 font-medium">Interactive Map View</p>
                    <p className="text-sm text-slate-500">
                      Real-time drone positions and flight paths would be displayed here
                    </p>
                    <p className="text-xs text-slate-400">
                      Integration with mapping services (Google Maps, Mapbox, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Missions</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {activeMissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Navigation className="h-8 w-8 mx-auto mb-2" />
                    <p>No active missions</p>
                  </div>
                ) : (
                  activeMissions.map((mission) => (
                    <Card key={mission._id?.toString()} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{mission.name}</h4>
                            <Badge className={getStatusColor(mission.status)}>{mission.status.replace("_", " ")}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Drone</p>
                              <p className="font-medium">{mission.drone.name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-medium capitalize">{mission.mission_type}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{mission.progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={mission.progress} />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatTime(mission.elapsed_time)} / {formatTime(mission.estimated_duration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4 text-muted-foreground" />
                              <span>{mission.drone.battery_level.toFixed(0)}%</span>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p>Altitude: {mission.parameters.altitude}m</p>
                            <p>Speed: {mission.parameters.speed}m/s</p>
                            <p>Waypoints: {mission.flight_path.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
