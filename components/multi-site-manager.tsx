"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, Building, Globe, Users } from "lucide-react"

interface Site {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address: string
    country: string
    timezone: string
  }
  type: "facility" | "warehouse" | "office" | "construction" | "other"
  status: "active" | "inactive" | "maintenance"
  drones_assigned: number
  active_missions: number
  created_at: Date
}

interface MultiSiteManagerProps {
  sites: Site[]
  onSiteSelected: (site: Site) => void
  currentSite?: Site
}

export function MultiSiteManager({ sites: initialSites, onSiteSelected, currentSite }: MultiSiteManagerProps) {
  const [sites, setSites] = useState<Site[]>(initialSites)
  const [isAddingSite, setIsAddingSite] = useState(false)
  const [newSite, setNewSite] = useState({
    name: "",
    address: "",
    country: "",
    timezone: "",
    type: "facility" as const,
    lat: 37.7749,
    lng: -122.4194,
  })

  // Mock sites if none provided
  const defaultSites: Site[] = [
    {
      id: "site-sf",
      name: "San Francisco HQ",
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: "123 Market St, San Francisco, CA",
        country: "United States",
        timezone: "America/Los_Angeles",
      },
      type: "office",
      status: "active",
      drones_assigned: 5,
      active_missions: 2,
      created_at: new Date("2024-01-15"),
    },
    {
      id: "site-la",
      name: "Los Angeles Warehouse",
      location: {
        lat: 34.0522,
        lng: -118.2437,
        address: "456 Industrial Blvd, Los Angeles, CA",
        country: "United States",
        timezone: "America/Los_Angeles",
      },
      type: "warehouse",
      status: "active",
      drones_assigned: 3,
      active_missions: 1,
      created_at: new Date("2024-02-01"),
    },
    {
      id: "site-ny",
      name: "New York Facility",
      location: {
        lat: 40.7128,
        lng: -74.006,
        address: "789 Broadway, New York, NY",
        country: "United States",
        timezone: "America/New_York",
      },
      type: "facility",
      status: "active",
      drones_assigned: 4,
      active_missions: 0,
      created_at: new Date("2024-01-20"),
    },
    {
      id: "site-london",
      name: "London Office",
      location: {
        lat: 51.5074,
        lng: -0.1278,
        address: "10 Downing St, London, UK",
        country: "United Kingdom",
        timezone: "Europe/London",
      },
      type: "office",
      status: "active",
      drones_assigned: 2,
      active_missions: 1,
      created_at: new Date("2024-03-01"),
    },
  ]

  const allSites = sites.length > 0 ? sites : defaultSites

  const addSite = () => {
    if (!newSite.name || !newSite.address) return

    const site: Site = {
      id: `site-${Date.now()}`,
      name: newSite.name,
      location: {
        lat: newSite.lat,
        lng: newSite.lng,
        address: newSite.address,
        country: newSite.country,
        timezone: newSite.timezone,
      },
      type: newSite.type,
      status: "active",
      drones_assigned: 0,
      active_missions: 0,
      created_at: new Date(),
    }

    setSites([...sites, site])
    setNewSite({
      name: "",
      address: "",
      country: "",
      timezone: "",
      type: "facility",
      lat: 37.7749,
      lng: -122.4194,
    })
    setIsAddingSite(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "office":
        return <Building className="h-4 w-4" />
      case "warehouse":
        return <Building className="h-4 w-4" />
      case "facility":
        return <Building className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const totalStats = allSites.reduce(
    (acc, site) => ({
      totalDrones: acc.totalDrones + site.drones_assigned,
      totalMissions: acc.totalMissions + site.active_missions,
      activeSites: acc.activeSites + (site.status === "active" ? 1 : 0),
    }),
    { totalDrones: 0, totalMissions: 0, activeSites: 0 },
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Multi-Site Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Global Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{allSites.length}</p>
              <p className="text-sm text-muted-foreground">Total Sites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{totalStats.totalDrones}</p>
              <p className="text-sm text-muted-foreground">Fleet Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{totalStats.totalMissions}</p>
              <p className="text-sm text-muted-foreground">Active Missions</p>
            </div>
          </div>

          {/* Add New Site */}
          {!isAddingSite ? (
            <Button onClick={() => setIsAddingSite(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Button>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        value={newSite.name}
                        onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                        placeholder="e.g., Tokyo Office"
                      />
                    </div>
                    <div>
                      <Label htmlFor="site-type">Type</Label>
                      <Select
                        value={newSite.type}
                        onValueChange={(value: any) => setNewSite({ ...newSite, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facility">Facility</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="site-address">Address</Label>
                    <Input
                      id="site-address"
                      value={newSite.address}
                      onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="site-country">Country</Label>
                      <Input
                        id="site-country"
                        value={newSite.country}
                        onChange={(e) => setNewSite({ ...newSite, country: e.target.value })}
                        placeholder="e.g., Japan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="site-timezone">Timezone</Label>
                      <Input
                        id="site-timezone"
                        value={newSite.timezone}
                        onChange={(e) => setNewSite({ ...newSite, timezone: e.target.value })}
                        placeholder="e.g., Asia/Tokyo"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addSite} size="sm">
                      Add Site
                    </Button>
                    <Button onClick={() => setIsAddingSite(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sites List */}
          <div className="space-y-3">
            <h4 className="font-medium">Global Sites</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allSites.map((site) => (
                <div
                  key={site.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentSite?.id === site.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSiteSelected(site)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(site.type)}
                        <h5 className="font-medium">{site.name}</h5>
                        <Badge className={getStatusColor(site.status)}>{site.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{site.location.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {site.location.country} • {site.location.timezone}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{site.drones_assigned}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{site.active_missions}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Added {site.created_at.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* World Map Visualization */}
          <div className="bg-slate-100 rounded-lg p-4 min-h-[200px] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
              <svg className="absolute inset-0" width="100%" height="100%">
                {allSites.map((site, index) => {
                  // Simple world map projection (very basic)
                  const x = ((site.location.lng + 180) / 360) * 100
                  const y = ((90 - site.location.lat) / 180) * 100
                  return (
                    <g key={site.id}>
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill={site.status === "active" ? "#3b82f6" : "#6b7280"}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => onSiteSelected(site)}
                      />
                      <text
                        x={`${x}%`}
                        y={`${y - 8}%`}
                        textAnchor="middle"
                        className="text-xs fill-current"
                        style={{ fontSize: "10px" }}
                      >
                        {site.name.split(" ")[0]}
                      </text>
                    </g>
                  )
                })}
              </svg>
              <div className="absolute bottom-2 left-2 bg-white p-2 rounded text-xs">
                <p className="font-medium">Global Site Distribution</p>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentSite && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Currently Managing: {currentSite.name}</p>
              <p className="text-sm text-blue-700">{currentSite.location.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
