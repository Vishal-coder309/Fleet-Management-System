"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, Square, Clock } from "lucide-react"
import { updateMissionStatus } from "@/lib/actions"
import { useTransition } from "react"
import type { Mission } from "@/lib/types"

interface ActiveMissionsTableProps {
  missions: (Mission & { drone: { name: string; model: string } })[]
}

export function ActiveMissionsTable({ missions }: ActiveMissionsTableProps) {
  const [isPending, startTransition] = useTransition()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "aborted":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const handleStatusUpdate = (missionId: string, newStatus: Mission["status"]) => {
    startTransition(async () => {
      await updateMissionStatus(missionId, newStatus)
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Missions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mission Name</TableHead>
              <TableHead>Drone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission._id?.toString()}>
                <TableCell className="font-medium">{mission.name}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{mission.drone.name}</div>
                    <div className="text-sm text-muted-foreground">{mission.drone.model}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{mission.mission_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(mission.status)}>{mission.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={Math.min((mission.elapsed_time / mission.estimated_duration) * 100, 100)} className="w-16" />
                    <span className="text-xs text-muted-foreground">{Math.min((mission.elapsed_time / mission.estimated_duration) * 100, 100).toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {formatTime(mission.elapsed_time)} / {formatTime(mission.estimated_duration)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {mission.status === "planned" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(mission._id!.toString(), "in_progress")}
                        disabled={isPending}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {mission.status === "in_progress" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(mission._id!.toString(), "paused")}
                          disabled={isPending}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(mission._id!.toString(), "aborted")}
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
                        onClick={() => handleStatusUpdate(mission._id!.toString(), "in_progress")}
                        disabled={isPending}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
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
