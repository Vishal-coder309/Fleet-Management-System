import { getSurveyReports, getOrganizationStats } from "@/lib/actions"
import { SurveyReportsTable } from "@/components/survey-reports-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Camera, Map } from "lucide-react"

export default async function ReportsPage() {
  const [reports, stats] = await Promise.all([getSurveyReports(), getOrganizationStats()])

  // Calculate additional report statistics
  const reportStats = {
    totalReports: reports.length,
    totalImages: reports.reduce((acc: number, r: any) => acc + r.summary.images_captured, 0),
    totalArea: reports.reduce((acc: number, r: any) => acc + r.summary.area_covered, 0),
    totalDistance: reports.reduce((acc: number, r: any) => acc + r.summary.total_distance, 0),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Survey Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive survey summaries and statistics</p>
      </div>

      {/* Report Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Survey reports generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Captured</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalImages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all missions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Area Covered</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalArea.toFixed(1)} km²</div>
            <p className="text-xs text-muted-foreground">Total surveyed area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance Flown</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalDistance.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">Total flight distance</p>
          </CardContent>
        </Card>
      </div>

      <SurveyReportsTable reports={reports} />
    </div>
  )
}
