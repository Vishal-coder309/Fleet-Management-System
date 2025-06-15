"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react"

interface NoFlyZone {
  id: string
  name: string
  type: "airport" | "military" | "restricted" | "temporary"
  coordinates: Array<{ lat: number; lng: number }>
  altitude_limit?: number
  active: boolean
  description?: string
}

interface NoFlyZoneManagerProps {
  zones: NoFlyZone[]
  onZonesUpdate: (zones: NoFlyZone[]) => void
  currentLocation?: { lat: number; lng: number }
}

export function NoFlyZoneManager({ zones: initialZones, onZonesUpdate, currentLocation }: NoFlyZoneManagerProps) {
  const [zones, setZones] = useState<NoFlyZone[]>(initialZones)
  const [isAddingZone, setIsAddingZone] = useState(false)
  const [newZone, setNewZone] = useState({
    name: "",
    type: "restricted" as const,
    description: "",
    altitude_limit: 0,
  })

  const defaultZones: NoFlyZone[] = [
    {
      id: "sfo-airport",
      name: "San Francisco International Airport",
      type: "airport",
      coordinates: [
        { lat: 37.6213, lng: -122.379 },
        { lat: 37.6213, lng: -122.365 },
        { lat: 37.605, lng: -122.365 },
        { lat: 37.605, lng: -122.379 },
      ],
      altitude_limit: 150,
      active: true,
      description: "Major international airport - strict no-fly zone",
    },
    {
      id: "military-base",
      name: "Military Installation",
      type: "military",
      coordinates: [
        { lat: 37.79, lng: -122.45 },
        { lat: 37.79, lng: -122.44 },
        { lat: 37.78, lng: -122.44 },
        { lat: 37.78, lng: -122.45 },
      ],
      active: true,
      description: "Restricted military airspace",
    },
    {
      id: "event-temp",
      name: "Temporary Event Restriction",
      type: "temporary",
      coordinates: [
        { lat: 37.77, lng: -122.41 },
        { lat: 37.77, lng: -122.4 },
        { lat: 37.76, lng: -122.4 },
        { lat: 37.76, lng: -122.41 },
      ],
      active: true,
      description: "Special event - temporary flight restriction",
    },
  ]

  const allZones = [...zones, ...defaultZones]

  const addZone = () => {
    if (!newZone.name) return

    const zone: NoFlyZone = {
      id: `custom-${Date.now()}`,
      name: newZone.name,
      type: newZone.type,
      description: newZone.description,
      altitude_limit: newZone.altitude_limit || undefined,
      active: true,
      coordinates: [
        // Default square around current location or SF
        { lat: (currentLocation?.lat || 37.7749) + 0.005, lng: (currentLocation?.lng || -122.4194) + 0.005 },
        { lat: (currentLocation?.lat || 37.7749) + 0.005, lng: (currentLocation?.lng || -122.4194) - 0.005 },
        { lat: (currentLocation?.lat || 37.7749) - 0.005, lng: (currentLocation?.lng || -122.4194) - 0.005 },
        { lat: (currentLocation?.lat || 37.7749) - 0.005, lng: (currentLocation?.lng || -122.4194) + 0.005 },
      ],
    }

    const updatedZones = [...zones, zone]
    setZones(updatedZones)
    onZonesUpdate(updatedZones)

    setNewZone({
      name: "",
      type: "restricted",
      description: "",
      altitude_limit: 0,
    })
    setIsAddingZone(false)
  }

  const removeZone = (id: string) => {
    const updatedZones = zones.filter((z) => z.id !== id)
    setZones(updatedZones)
    onZonesUpdate(updatedZones)
  }

  const toggleZone = (id: string) => {
    const updatedZones = zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z))
    setZones(updatedZones)
    onZonesUpdate(updatedZones)
  }

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case "airport":
        return "bg-red-100 text-red-800"
      case "military":
        return "bg-orange-100 text-orange-800"
      case "restricted":
        return "bg-yellow-100 text-yellow-800"
      case "temporary":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const checkProximityWarning = () => {
    if (!currentLocation) return null

    const nearbyZones = allZones.filter((zone) => {
      if (!zone.active) return false

      // Simple distance check to first coordinate
      const firstCoord = zone.coordinates[0]
      const distance = Math.sqrt(
        Math.pow(currentLocation.lat - firstCoord.lat, 2) + Math.pow(currentLocation.lng - firstCoord.lng, 2),
      )
      return distance < 0.01 // Approximately 1km
    })

    return nearbyZones.length > 0 ? nearbyZones : null
  }

  const nearbyZones = checkProximityWarning()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          No-Fly Zone Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Proximity Warning */}
          {nearbyZones && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> {nearbyZones.length} no-fly zone{nearbyZones.length > 1 ? "s" : ""} detected
                nearby: {nearbyZones.map((z) => z.name).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Zone */}
          {!isAddingZone ? (
            <Button onClick={() => setIsAddingZone(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom No-Fly Zone
            </Button>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="zone-name">Zone Name</Label>
                      <Input
                        id="zone-name"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        placeholder="e.g., Construction Site"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone-type">Type</Label>
                      <select
                        id="zone-type"
                        value={newZone.type}
                        onChange={(e) => setNewZone({ ...newZone, type: e.target.value as any })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="restricted">Restricted</option>
                        <option value="temporary">Temporary</option>
                        <option value="airport">Airport</option>
                        <option value="military">Military</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zone-description">Description</Label>
                    <Input
                      id="zone-description"
                      value={newZone.description}
                      onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addZone} size="sm">
                      Add Zone
                    </Button>
                    <Button onClick={() => setIsAddingZone(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zone List */}
          <div className="space-y-3">
            <h4 className="font-medium">Active No-Fly Zones</h4>
            {allZones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No no-fly zones configured</p>
            ) : (
              <div className="space-y-2">
                {allZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-3 rounded-lg border ${zone.active ? "bg-white" : "bg-gray-50 opacity-60"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{zone.name}</h5>
                          <Badge className={getZoneTypeColor(zone.type)}>{zone.type}</Badge>
                          {zone.active ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        {zone.description && <p className="text-sm text-muted-foreground">{zone.description}</p>}
                        {zone.altitude_limit && (
                          <p className="text-xs text-muted-foreground">Max altitude: {zone.altitude_limit}m</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!zone.id.startsWith("custom-") ? (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        ) : (
                          <>
                            <Button onClick={() => toggleZone(zone.id)} variant="outline" size="sm" className="text-xs">
                              {zone.active ? "Disable" : "Enable"}
                            </Button>
                            <Button onClick={() => removeZone(zone.id)} variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zone Visualization */}
          <div className="bg-slate-100 rounded-lg p-4 min-h-[200px] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
              <svg className="absolute inset-0" width="100%" height="100%">
                {allZones
                  .filter((zone) => zone.active)
                  .map((zone) => (
                    <polygon
                      key={zone.id}
                      points={zone.coordinates
                        .map((coord) => {
                          const x = ((coord.lng + 122.4194) * 2000) % 100
                          const y = ((37.7749 - coord.lat) * 2000) % 100
                          return `${Math.max(0, Math.min(100, x))},${Math.max(0, Math.min(100, y))}`
                        })
                        .join(" ")}
                      fill={
                        zone.type === "airport"
                          ? "rgba(239, 68, 68, 0.3)"
                          : zone.type === "military"
                            ? "rgba(249, 115, 22, 0.3)"
                            : "rgba(234, 179, 8, 0.3)"
                      }
                      stroke={zone.type === "airport" ? "#ef4444" : zone.type === "military" ? "#f97316" : "#eab308"}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  ))}
              </svg>
              <div className="absolute bottom-2 left-2 bg-white p-2 rounded text-xs">
                <p className="font-medium">No-Fly Zones Overlay</p>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span>Airport</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-400 rounded"></div>
                    <span>Military</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span>Restricted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {allZones.filter((z) => z.active).length} active zones • Always check current NOTAMs before flight
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
