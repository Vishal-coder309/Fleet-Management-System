import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Battery, MapPin } from "lucide-react"
import type { Drone } from "@/lib/types"

interface DroneFleetTableProps {
  drones: Drone[]
}

export function DroneFleetTable({ drones }: DroneFleetTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "in_mission":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "maintenance":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "charging":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drone Fleet Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drone Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capabilities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drones.map((drone) => (
              <TableRow key={drone._id?.toString()}>
                <TableCell className="font-medium">{drone.name}</TableCell>
                <TableCell>{drone.model}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(drone.status)}>{drone.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Battery className={`h-4 w-4 ${getBatteryColor(drone.battery_level)}`} />
                    <span className={getBatteryColor(drone.battery_level)}>{drone.battery_level}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {drone.capabilities.slice(0, 2).map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability.replace("_", " ")}
                      </Badge>
                    ))}
                    {drone.capabilities.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{drone.capabilities.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
