"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Square, Trash2, Save } from "lucide-react"

interface SurveyAreaSelectorProps {
  onAreaSelected: (area: { type: "polygon"; coordinates: Array<[number, number]> }) => void
  initialArea?: { type: "polygon"; coordinates: Array<[number, number]> }
}

export function SurveyAreaSelector({ onAreaSelected, initialArea }: SurveyAreaSelectorProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>(
    initialArea?.coordinates.map(([lng, lat]) => ({ lat, lng })) || [],
  )
  const [selectedTool, setSelectedTool] = useState<"polygon" | "rectangle" | null>(null)

  const handleMapClick = (lat: number, lng: number) => {
    if (!isDrawing) return

    if (selectedTool === "polygon") {
      setPoints([...points, { lat, lng }])
    } else if (selectedTool === "rectangle" && points.length === 0) {
      setPoints([{ lat, lng }])
    } else if (selectedTool === "rectangle" && points.length === 1) {
      const firstPoint = points[0]
      const rectanglePoints = [firstPoint, { lat: firstPoint.lat, lng }, { lat, lng }, { lat, lng: firstPoint.lng }]
      setPoints(rectanglePoints)
      finishDrawing(rectanglePoints)
    }
  }

  const startDrawing = (tool: "polygon" | "rectangle") => {
    setSelectedTool(tool)
    setIsDrawing(true)
    setPoints([])
  }

  const finishDrawing = (finalPoints = points) => {
    if (finalPoints.length >= 3) {
      const coordinates: Array<[number, number]> = finalPoints.map((p) => [p.lng, p.lat])
      onAreaSelected({
        type: "polygon",
        coordinates,
      })
    }
    setIsDrawing(false)
    setSelectedTool(null)
  }

  const clearArea = () => {
    setPoints([])
    setIsDrawing(false)
    setSelectedTool(null)
  }

  const calculateArea = () => {
    if (points.length < 3) return 0

    // Simple polygon area calculation (approximate)
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].lat * points[j].lng
      area -= points[j].lat * points[i].lng
    }
    return Math.abs(area / 2) * 111000 * 111000 // Convert to square meters (approximate)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="h-5 w-5" />
          Survey Area Definition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drawing Tools */}
          <div className="flex gap-2">
            <Button
              variant={selectedTool === "polygon" ? "default" : "outline"}
              size="sm"
              onClick={() => startDrawing("polygon")}
              disabled={isDrawing && selectedTool !== "polygon"}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Draw Polygon
            </Button>
            <Button
              variant={selectedTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => startDrawing("rectangle")}
              disabled={isDrawing && selectedTool !== "rectangle"}
            >
              <Square className="h-4 w-4 mr-2" />
              Draw Rectangle
            </Button>
            <Button variant="outline" size="sm" onClick={clearArea} disabled={points.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            {isDrawing && selectedTool === "polygon" && points.length >= 3 && (
              <Button size="sm" onClick={() => finishDrawing()}>
                <Save className="h-4 w-4 mr-2" />
                Finish
              </Button>
            )}
          </div>

          {/* Interactive Map Area */}
          <div className="bg-slate-100 rounded-lg p-4 min-h-[300px] relative overflow-hidden cursor-crosshair">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="survey-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#survey-grid)" />
                </svg>
              </div>

              {/* Survey area visualization */}
              {points.length > 0 && (
                <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                  {/* Draw polygon */}
                  {points.length >= 3 && (
                    <polygon
                      points={points
                        .map((p) => {
                          const x = ((p.lng + 122.4194) * 1000) % 100
                          const y = ((37.7749 - p.lat) * 1000) % 100
                          return `${Math.max(0, Math.min(100, x))},${Math.max(0, Math.min(100, y))}`
                        })
                        .join(" ")}
                      fill="rgba(59, 130, 246, 0.2)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}

                  {/* Draw points */}
                  {points.map((point, index) => {
                    const x = ((point.lng + 122.4194) * 1000) % 100
                    const y = ((37.7749 - point.lat) * 1000) % 100
                    return (
                      <circle
                        key={index}
                        cx={`${Math.max(0, Math.min(100, x))}%`}
                        cy={`${Math.max(0, Math.min(100, y))}%`}
                        r="4"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                      />
                    )
                  })}

                  {/* Draw lines for polygon in progress */}
                  {points.length >= 2 &&
                    points.slice(0, -1).map((point, index) => {
                      const nextPoint = points[index + 1]
                      const x1 = ((point.lng + 122.4194) * 1000) % 100
                      const y1 = ((37.7749 - point.lat) * 1000) % 100
                      const x2 = ((nextPoint.lng + 122.4194) * 1000) % 100
                      const y2 = ((37.7749 - nextPoint.lat) * 1000) % 100
                      return (
                        <line
                          key={index}
                          x1={`${Math.max(0, Math.min(100, x1))}%`}
                          y1={`${Math.max(0, Math.min(100, y1))}%`}
                          x2={`${Math.max(0, Math.min(100, x2))}%`}
                          y2={`${Math.max(0, Math.min(100, y2))}%`}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      )
                    })}
                </svg>
              )}

              {/* Click handler overlay */}
              <div
                className="absolute inset-0"
                onClick={(e) => {
                  if (!isDrawing) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = (e.clientX - rect.left) / rect.width
                  const y = (e.clientY - rect.top) / rect.height
                  const lat = 37.7749 - y * 0.01
                  const lng = -122.4194 + x * 0.01
                  handleMapClick(lat, lng)
                }}
              />

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg text-sm">
                {isDrawing ? (
                  <div>
                    <p className="font-medium text-blue-600">
                      {selectedTool === "polygon" ? "Click to add points" : "Click two corners for rectangle"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTool === "polygon" && points.length >= 3 && "Click 'Finish' or add more points"}
                      {selectedTool === "rectangle" && points.length === 1 && "Click opposite corner"}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a drawing tool to define survey area</p>
                )}
              </div>
            </div>
          </div>

          {/* Area Information */}
          {points.length >= 3 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Survey Area Defined</p>
                <p className="text-sm text-blue-700">
                  {points.length} points • ~{(calculateArea() / 1000000).toFixed(2)} km²
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
            </div>
          )}

          {/* Status */}
          <div className="text-xs text-muted-foreground">
            {isDrawing && (
              <p>
                Drawing {selectedTool}... {points.length} point{points.length !== 1 ? "s" : ""} added
              </p>
            )}
            {!isDrawing && points.length === 0 && <p>No survey area defined</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
