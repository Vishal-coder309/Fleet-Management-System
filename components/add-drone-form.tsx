"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addDrone } from "@/lib/actions"
import { Plus } from "lucide-react"

interface AddDroneFormProps {
  organizationId: string
  onSuccess?: () => void
}

export function AddDroneForm({ organizationId, onSuccess }: AddDroneFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serial_number: "",
    firmware_version: "",
    max_flight_time: 30,
    battery_level: 100,
    capabilities: [] as string[],
    sensors: [] as string[],
    location: {
      lat: 37.7749,
      lng: -122.4194,
      altitude: 0,
    },
  })

  const availableCapabilities = [
    "mapping",
    "inspection",
    "surveillance",
    "thermal_imaging",
    "night_vision",
    "photography",
    "videography",
  ]

  const availableSensors = [
    "RGB Camera",
    "Thermal Camera",
    "LiDAR",
    "Multispectral",
    "GPS",
    "IMU",
    "Barometer",
    "Magnetometer",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.model || !formData.serial_number) {
      alert("Please fill in all required fields")
      return
    }

    startTransition(async () => {
      try {
        await addDrone({
          ...formData,
          organization_id: organizationId as any,
          status: "available",
          created_at: new Date(),
        })

        // Reset form
        setFormData({
          name: "",
          model: "",
          serial_number: "",
          firmware_version: "",
          max_flight_time: 30,
          battery_level: 100,
          capabilities: [],
          sensors: [],
          location: {
            lat: 37.7749,
            lng: -122.4194,
            altitude: 0,
          },
        })

        setIsOpen(false)
        onSuccess?.()
        alert("Drone added successfully!")
      } catch (error) {
        alert("Failed to add drone. Please try again.")
      }
    })
  }

  const handleCapabilityChange = (capability: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capability],
      })
    } else {
      setFormData({
        ...formData,
        capabilities: formData.capabilities.filter((c) => c !== capability),
      })
    }
  }

  const handleSensorChange = (sensor: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        sensors: [...formData.sensors, sensor],
      })
    } else {
      setFormData({
        ...formData,
        sensors: formData.sensors.filter((s) => s !== sensor),
      })
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="mb-4">
        <Plus className="h-4 w-4 mr-2" />
        Add New Drone
      </Button>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Drone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Drone Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Surveyor-06"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drone model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DJI Matrice 300">DJI Matrice 300</SelectItem>
                  <SelectItem value="DJI Phantom 4 Pro">DJI Phantom 4 Pro</SelectItem>
                  <SelectItem value="Autel EVO II Pro">Autel EVO II Pro</SelectItem>
                  <SelectItem value="DJI Matrice 30T">DJI Matrice 30T</SelectItem>
                  <SelectItem value="Parrot ANAFI USA">Parrot ANAFI USA</SelectItem>
                  <SelectItem value="Skydio X2">Skydio X2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="e.g., DJI-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmware_version">Firmware Version</Label>
              <Input
                id="firmware_version"
                value={formData.firmware_version}
                onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                placeholder="e.g., v2.1.3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_flight_time">Max Flight Time (minutes)</Label>
              <Input
                id="max_flight_time"
                type="number"
                value={formData.max_flight_time}
                onChange={(e) => setFormData({ ...formData, max_flight_time: Number.parseInt(e.target.value) || 30 })}
                min="10"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="battery_level">Current Battery Level (%)</Label>
              <Input
                id="battery_level"
                type="number"
                value={formData.battery_level}
                onChange={(e) => setFormData({ ...formData, battery_level: Number.parseInt(e.target.value) || 100 })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableCapabilities.map((capability) => (
                <div key={capability} className="flex items-center space-x-2">
                  <Checkbox
                    id={capability}
                    checked={formData.capabilities.includes(capability)}
                    onCheckedChange={(checked) => handleCapabilityChange(capability, checked as boolean)}
                  />
                  <Label htmlFor={capability} className="text-sm">
                    {capability.replace("_", " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sensors</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableSensors.map((sensor) => (
                <div key={sensor} className="flex items-center space-x-2">
                  <Checkbox
                    id={sensor}
                    checked={formData.sensors.includes(sensor)}
                    onCheckedChange={(checked) => handleSensorChange(sensor, checked as boolean)}
                  />
                  <Label htmlFor={sensor} className="text-sm">
                    {sensor}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={formData.location.lat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, lat: Number.parseFloat(e.target.value) || 37.7749 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                value={formData.location.lng}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, lng: Number.parseFloat(e.target.value) || -122.4194 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altitude">Altitude (m)</Label>
              <Input
                id="altitude"
                type="number"
                value={formData.location.altitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, altitude: Number.parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding Drone..." : "Add Drone"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
