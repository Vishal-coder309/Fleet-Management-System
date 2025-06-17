"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Zap, AlertTriangle, Play, Pause, Square } from "lucide-react"
import { updateMissionStatus } from "@/lib/actions"
import { useTransition } from "react"
import type { Mission, Drone } from "@/lib/types"

interface LiveTrackingMapProps {
  missions: (Mission & { drone: Drone })[]
  drones: Drone[]
}

export function LiveTrackingMap({ missions: initialMissions, drones: initialDrones }: LiveTrackingMapProps) {
  const [missions, setMissions] = useState(initialMissions)
  const [drones, setDrones] = useState(initialDrones)
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate mission progress updates
      setMissions((prevMissions) =>
        prevMissions.map((mission) => {
          if (mission.status === "in_progress") {
            const newProgress = Math.min(mission.progress + Math.random() * 2, 100)
            const newElapsedTime = mission.elapsed_time + 0.5

            return {
              ...mission,
              progress: newProgress,
              elapsed_time: newElapsedTime,
            }
          }
          return mission
        }),
      )

      // Simulate drone location updates
      setDrones((prevDrones) =>
        prevDrones.map((drone) => {
          if (drone.status === "in_mission") {
            // Simulate movement
            return {
              ...drone,
              location: {
                ...drone.location,
                lat: drone.location.lat + (Math.random() - 0.5) * 0.0001,
                lng: drone.location.lng + (Math.random() - 0.5) * 0.0001,
              },
              battery_level: Math.max(drone.battery_level - Math.random() * 0.1, 0),
            }
          }
          return drone
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const activeMissions = missions.filter((m) => ["in_progress", "paused"].includes(m.status))

  const handleMissionControl = (missionId: string, action: Mission["status"]) => {
    startTransition(async () => {
      await updateMissionStatus(missionId, action)
      // Update local state optimistically
      setMissions((prev) => prev.map((m) => (m._id?.toString() === missionId ? { ...m, status: action } : m)))
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "available":
        return "bg-blue-500"
      case "maintenance":
        return "bg-red-500"
      case "charging":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Drone Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Map Area */}
            <div className="lg:col-span-2">
              <div className="bg-slate-100 rounded-lg p-4 min-h-[500px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Grid overlay to simulate map */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Drone positions */}
                  {drones.map((drone, index) => {
                    const x = 50 + (drone.location.lng + 122.4194) * 2000
                    const y = 50 + (37.7749 - drone.location.lat) * 2000
                    const isSelected = selectedDrone === drone._id?.toString()

                    return (
                      <div
                        key={drone._id?.toString()}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                          isSelected ? "scale-125 z-10" : "hover:scale-110"
                        }`}
                        style={{
                          left: `${Math.max(5, Math.min(95, x))}%`,
                          top: `${Math.max(5, Math.min(95, y))}%`,
                        }}
                        onClick={() => setSelectedDrone(isSelected ? null : drone._id?.toString())}
                      >
                        <div className="relative">
                          <div
                            className={`w-4 h-4 rounded-full ${getStatusColor(
                              drone.status,
                            )} border-2 border-white shadow-lg`}
                          />
                          {drone.status === "in_mission" && (
                            <div className="absolute -inset-2 rounded-full border-2 border-green-400 animate-ping" />
                          )}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {drone.name}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Flight paths */}
                  {activeMissions.map((mission) => {
                    if (!mission.flight_path || mission.flight_path.length < 2) return null

                    return (
                      <svg
                        key={mission._id?.toString()}
                        className="absolute inset-0 pointer-events-none"
                        width="100%"
                        height="100%"
                      >
                        <path
                          d={mission.flight_path
                            .map((point, index) => {
                              const x = 50 + (point.lng + 122.4194) * 2000
                              const y = 50 + (37.7749 - point.lat) * 2000
                              return `${index === 0 ? "M" : "L"} ${Math.max(0, Math.min(100, x))}% ${Math.max(
                                0,
                                Math.min(100, y),
                              )}%`
                            })
                            .join(" ")}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          fill="none"
                          className="animate-pulse"
                        />
                      </svg>
                    )
                  })}

                  {/* Map legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <h4 className="font-semibold text-sm mb-2">Legend</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Active Mission</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Maintenance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-0.5 bg-blue-500" style={{ strokeDasharray: "2,2" }} />
                        <span>Flight Path</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              <h3 className="font-semibold">Mission Control</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {activeMissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>No active missions</p>
                  </div>
                ) : (
                  activeMissions.map((mission) => (
                    <Card key={mission._id?.toString()} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{mission.name}</h4>
                            <Badge
                              className={
                                mission.status === "in_progress"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {mission.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p>Drone: {mission.drone.name}</p>
                            <p>Progress: {Math.round(mission.progress)}%</p>
                            <p>
                              Time: {mission.progress >= 100 || mission.status === "completed" ? `${Math.round(mission.elapsed_time)}m (Completed)` : `${Math.round(mission.elapsed_time)}m / ${mission.estimated_duration}m`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <Zap className={`h-3 w-3 ${getBatteryColor(mission.drone.battery_level)}`} />
                            <span className={getBatteryColor(mission.drone.battery_level)}>
                              {Math.round(mission.drone.battery_level)}%
                            </span>
                            {mission.drone.battery_level < 20 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          </div>

                          <div className="flex gap-1">
                            {mission.status === "in_progress" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMissionControl(mission._id!.toString(), "paused")}
                                  disabled={isPending}
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMissionControl(mission._id!.toString(), "aborted")}
                                  disabled={isPending}
                                >
                                  <Square className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {mission.status === "paused" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMissionControl(mission._id!.toString(), "in_progress")}
                                disabled={isPending}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
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
