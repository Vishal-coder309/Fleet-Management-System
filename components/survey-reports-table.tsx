import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Clock, Camera, Map } from "lucide-react"
import type { SurveyReport } from "@/lib/types"

interface SurveyReportsTableProps {
  reports: (SurveyReport & {
    mission: { name: string; mission_type: string }
    drone: { name: string; model: string }
  })[]
}

export function SurveyReportsTable({ reports }: SurveyReportsTableProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Survey Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p>No survey reports available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission</TableHead>
                <TableHead>Drone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id?.toString()}>
                  <TableCell className="font-medium">{report.mission.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.drone.name}</div>
                      <div className="text-sm text-muted-foreground">{report.drone.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.mission.mission_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatTime(report.summary.flight_duration)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Map className="h-3 w-3 text-muted-foreground" />
                      <span>{report.summary.area_covered} km²</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Camera className="h-3 w-3 text-muted-foreground" />
                      <span>{report.summary.images_captured}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.summary.total_distance} km</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(report.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
