"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createMission } from "@/lib/actions"
import type { Drone } from "@/lib/types"

interface MissionPlanningFormProps {
  drones: Drone[]
  organizationId: string
}

export function MissionPlanningForm({ drones, organizationId }: MissionPlanningFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: "",
    drone_id: "",
    mission_type: "",
    flight_pattern: "",
    altitude: 100,
    speed: 5,
    overlap_percentage: 70,
    sensor_frequency: 2,
    estimated_duration: 30,
    flight_path: "",
  })

  const availableDrones = drones.filter((drone) => drone.status === "available")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.drone_id || !formData.mission_type || !formData.flight_pattern) {
      alert("Please fill in all required fields")
      return
    }

    // Parse flight path coordinates
    let flightPath = []
    try {
      if (formData.flight_path.trim()) {
        const coordinates = formData.flight_path.split("\n").map((line) => {
          const [lat, lng] = line.split(",").map((coord) => Number.parseFloat(coord.trim()))
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error("Invalid coordinates")
          }
          return { lat, lng, altitude: formData.altitude }
        })
        flightPath = coordinates
      } else {
        // Generate default flight path based on pattern
        flightPath = generateDefaultFlightPath(formData.flight_pattern, formData.altitude)
      }
    } catch (error) {
      alert('Invalid flight path format. Please use "lat, lng" format, one per line.')
      return
    }

    startTransition(async () => {
      try {
        await createMission({
          name: formData.name,
          drone_id: formData.drone_id as any,
          organization_id: organizationId as any,
          status: "planned",
          mission_type: formData.mission_type as any,
          flight_pattern: formData.flight_pattern as any,
          parameters: {
            altitude: formData.altitude,
            speed: formData.speed,
            overlap_percentage: formData.overlap_percentage,
            sensor_frequency: formData.sensor_frequency,
          },
          flight_path: flightPath,
          estimated_duration: formData.estimated_duration,
        })

        // Reset form
        setFormData({
          name: "",
          drone_id: "",
          mission_type: "",
          flight_pattern: "",
          altitude: 100,
          speed: 5,
          overlap_percentage: 70,
          sensor_frequency: 2,
          estimated_duration: 30,
          flight_path: "",
        })

        alert("Mission created successfully!")
      } catch (error) {
        console.error("Error creating mission:", error)
        alert("Failed to create mission. Please try again.")
      }
    })
  }

  const generateDefaultFlightPath = (pattern: string, altitude: number) => {
    // Generate a simple default flight path based on pattern
    const baseCoords = { lat: 37.7749, lng: -122.4194 }

    switch (pattern) {
      case "perimeter":
        return [
          { lat: baseCoords.lat, lng: baseCoords.lng, altitude },
          { lat: baseCoords.lat + 0.001, lng: baseCoords.lng, altitude },
          { lat: baseCoords.lat + 0.001, lng: baseCoords.lng + 0.001, altitude },
          { lat: baseCoords.lat, lng: baseCoords.lng + 0.001, altitude },
          { lat: baseCoords.lat, lng: baseCoords.lng, altitude },
        ]
      case "crosshatch":
        return [
          { lat: baseCoords.lat, lng: baseCoords.lng, altitude },
          { lat: baseCoords.lat + 0.002, lng: baseCoords.lng, altitude },
          { lat: baseCoords.lat + 0.002, lng: baseCoords.lng + 0.0005, altitude },
          { lat: baseCoords.lat, lng: baseCoords.lng + 0.0005, altitude },
          { lat: baseCoords.lat, lng: baseCoords.lng + 0.001, altitude },
          { lat: baseCoords.lat + 0.002, lng: baseCoords.lng + 0.001, altitude },
        ]
      default:
        return [
          { lat: baseCoords.lat, lng: baseCoords.lng, altitude },
          { lat: baseCoords.lat + 0.001, lng: baseCoords.lng + 0.001, altitude },
        ]
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan New Mission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mission Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter mission name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drone">Select Drone *</Label>
              <Select
                value={formData.drone_id}
                onValueChange={(value) => setFormData({ ...formData, drone_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose available drone" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrones.map((drone) => (
                    <SelectItem key={drone._id?.toString()} value={drone._id?.toString() || ""}>
                      {drone.name} - {drone.model} ({drone.battery_level}% battery)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission_type">Mission Type *</Label>
              <Select
                value={formData.mission_type}
                onValueChange={(value) => setFormData({ ...formData, mission_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="mapping">Mapping</SelectItem>
                  <SelectItem value="surveillance">Surveillance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flight_pattern">Flight Pattern *</Label>
              <Select
                value={formData.flight_pattern}
                onValueChange={(value) => setFormData({ ...formData, flight_pattern: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flight pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perimeter">Perimeter</SelectItem>
                  <SelectItem value="crosshatch">Crosshatch</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="altitude">Altitude (m)</Label>
              <Input
                id="altitude"
                type="number"
                value={formData.altitude}
                onChange={(e) => setFormData({ ...formData, altitude: Number.parseInt(e.target.value) || 100 })}
                min="10"
                max="400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speed">Speed (m/s)</Label>
              <Input
                id="speed"
                type="number"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: Number.parseInt(e.target.value) || 5 })}
                min="1"
                max="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlap">Overlap Percentage (%)</Label>
              <Input
                id="overlap"
                type="number"
                value={formData.overlap_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, overlap_percentage: Number.parseInt(e.target.value) || 70 })
                }
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_duration: Number.parseInt(e.target.value) || 30 })
                }
                min="5"
                max="120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight_path">Custom Flight Path (optional)</Label>
            <Textarea
              id="flight_path"
              value={formData.flight_path}
              onChange={(e) => setFormData({ ...formData, flight_path: e.target.value })}
              placeholder="Enter coordinates as lat, lng (one per line)&#10;Example:&#10;37.7749, -122.4194&#10;37.7759, -122.4184"
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use default pattern. Format: latitude, longitude (one per line)
            </p>
          </div>

          <Button type="submit" disabled={isPending || availableDrones.length === 0} className="w-full">
            {isPending ? "Creating Mission..." : "Create Mission"}
          </Button>

          {availableDrones.length === 0 && (
            <p className="text-sm text-red-600 text-center">No drones available for mission assignment</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
