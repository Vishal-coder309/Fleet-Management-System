"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SurveyAreaSelector } from "./survey-area-selector"
import { WeatherIntegration } from "./weather-integration"
import { NoFlyZoneManager } from "./no-fly-zone-manager"
import { MultiSiteManager } from "./multi-site-manager"
import { createMission } from "@/lib/actions"
import { MapPin, Settings, Cloud, ShieldAlert, Globe } from "lucide-react"
import type { Drone } from "@/lib/types"

interface EnhancedMissionPlanningProps {
  drones: Drone[]
  organizationId: string
}

export function EnhancedMissionPlanning({ drones, organizationId }: EnhancedMissionPlanningProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const [weatherConditions, setWeatherConditions] = useState<any>(null)
  const [noFlyZones, setNoFlyZones] = useState<any[]>([])
  const [surveyArea, setSurveyArea] = useState<any>(null)

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
    sensors_enabled: [] as string[],
    flight_path: "",
    priority: "normal",
    auto_return_battery: 25,
    max_wind_speed: 20,
  })

  const availableDrones = drones.filter((drone) => drone.status === "available")

  const handleSensorChange = (sensor: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        sensors_enabled: [...formData.sensors_enabled, sensor],
      })
    } else {
      setFormData({
        ...formData,
        sensors_enabled: formData.sensors_enabled.filter((s) => s !== sensor),
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.drone_id || !formData.mission_type || !formData.flight_pattern) {
      alert("Please fill in all required fields")
      return
    }

    // Safety checks
    if (weatherConditions && !weatherConditions.flightSafe) {
      if (!confirm("Weather conditions are not optimal for flight. Continue anyway?")) {
        return
      }
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
        // Generate default flight path based on pattern and survey area
        flightPath = generateFlightPath(formData.flight_pattern, formData.altitude, surveyArea)
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
          site_id: selectedSite?.id as any,
          status: "planned",
          mission_type: formData.mission_type as any,
          flight_pattern: formData.flight_pattern as any,
          parameters: {
            altitude: formData.altitude,
            speed: formData.speed,
            overlap_percentage: formData.overlap_percentage,
            sensor_frequency: formData.sensor_frequency,
            sensors_enabled: formData.sensors_enabled,
          },
          flight_path: flightPath,
          survey_area: surveyArea,
          estimated_duration: formData.estimated_duration,
          weather_conditions: weatherConditions,
          safety_checks: {
            no_fly_zone_clear: noFlyZones.length === 0,
            weather_acceptable: weatherConditions?.flightSafe || false,
            battery_sufficient: true,
          },
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
          sensors_enabled: [],
          flight_path: "",
          priority: "normal",
          auto_return_battery: 25,
          max_wind_speed: 20,
        })

        alert("Mission created successfully!")
      } catch (error) {
        console.error("Error creating mission:", error)
        alert("Failed to create mission. Please try again.")
      }
    })
  }

  const generateFlightPath = (pattern: string, altitude: number, area: any) => {
    const baseCoords = selectedSite?.location || { lat: 37.7749, lng: -122.4194 }

    if (area && area.coordinates) {
      // Generate path based on survey area
      const bounds = area.coordinates.reduce(
        (acc: any, coord: any) => ({
          minLat: Math.min(acc.minLat, coord[1]),
          maxLat: Math.max(acc.maxLat, coord[1]),
          minLng: Math.min(acc.minLng, coord[0]),
          maxLng: Math.max(acc.maxLng, coord[0]),
        }),
        {
          minLat: Number.POSITIVE_INFINITY,
          maxLat: Number.NEGATIVE_INFINITY,
          minLng: Number.POSITIVE_INFINITY,
          maxLng: Number.NEGATIVE_INFINITY,
        },
      )

      if (pattern === "crosshatch") {
        const path = []
        const steps = 5
        for (let i = 0; i <= steps; i++) {
          const lat = bounds.minLat + (i / steps) * (bounds.maxLat - bounds.minLat)
          path.push({ lat, lng: bounds.minLng, altitude })
          path.push({ lat, lng: bounds.maxLng, altitude })
        }
        return path
      }
    }

    // Default patterns
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

  const selectedDrone = availableDrones.find((d) => d._id?.toString() === formData.drone_id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Mission Planning</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Survey Area
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Safety
            </TabsTrigger>
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sites
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            <TabsContent value="basic" className="space-y-4">
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
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

              {/* Advanced Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Label htmlFor="overlap">Overlap (%)</Label>
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
                  <Label htmlFor="auto_return">Auto Return Battery (%)</Label>
                  <Input
                    id="auto_return"
                    type="number"
                    value={formData.auto_return_battery}
                    onChange={(e) =>
                      setFormData({ ...formData, auto_return_battery: Number.parseInt(e.target.value) || 25 })
                    }
                    min="10"
                    max="50"
                  />
                </div>
              </div>

              {/* Sensor Configuration */}
              {selectedDrone && selectedDrone.sensors && (
                <div className="space-y-2">
                  <Label>Sensors to Enable</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedDrone.sensors.map((sensor) => (
                      <div key={sensor} className="flex items-center space-x-2">
                        <Checkbox
                          id={sensor}
                          checked={formData.sensors_enabled.includes(sensor)}
                          onCheckedChange={(checked) => handleSensorChange(sensor, checked as boolean)}
                        />
                        <Label htmlFor={sensor} className="text-sm">
                          {sensor}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="area">
              <SurveyAreaSelector onAreaSelected={setSurveyArea} initialArea={surveyArea} />
            </TabsContent>

            <TabsContent value="weather">
              <WeatherIntegration
                location={selectedSite?.location || { lat: 37.7749, lng: -122.4194 }}
                onWeatherUpdate={setWeatherConditions}
              />
            </TabsContent>

            <TabsContent value="safety">
              <NoFlyZoneManager
                zones={noFlyZones}
                onZonesUpdate={setNoFlyZones}
                currentLocation={selectedSite?.location}
              />
            </TabsContent>

            <TabsContent value="sites">
              <MultiSiteManager sites={[]} onSiteSelected={setSelectedSite} currentSite={selectedSite} />
            </TabsContent>

            <div className="flex gap-2 mt-6">
              <Button type="submit" disabled={isPending || availableDrones.length === 0}>
                {isPending ? "Creating Mission..." : "Create Mission"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Reset
              </Button>
            </div>

            {availableDrones.length === 0 && (
              <p className="text-sm text-red-600 text-center mt-2">No drones available for mission assignment</p>
            )}
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
