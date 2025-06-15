"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cloud, Wind, Thermometer, Eye, AlertTriangle, CheckCircle } from "lucide-react"

interface WeatherData {
  temperature: number
  windSpeed: number
  windDirection: number
  visibility: number
  conditions: string
  humidity: number
  pressure: number
}

interface WeatherIntegrationProps {
  location: { lat: number; lng: number }
  onWeatherUpdate: (conditions: WeatherData & { flightSafe: boolean }) => void
}

export function WeatherIntegration({ location, onWeatherUpdate }: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulate weather data fetching
  useEffect(() => {
    const fetchWeather = () => {
      setLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        const mockWeather: WeatherData = {
          temperature: Math.round(15 + Math.random() * 20), // 15-35°C
          windSpeed: Math.round(Math.random() * 25), // 0-25 km/h
          windDirection: Math.round(Math.random() * 360), // 0-360°
          visibility: Math.round(8 + Math.random() * 7), // 8-15 km
          conditions: ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Overcast"][Math.floor(Math.random() * 5)],
          humidity: Math.round(40 + Math.random() * 40), // 40-80%
          pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
        }

        const flightSafe =
          mockWeather.windSpeed <= 20 &&
          mockWeather.visibility >= 5 &&
          !["Heavy Rain", "Thunderstorm", "Snow"].includes(mockWeather.conditions)

        setWeather(mockWeather)
        onWeatherUpdate({ ...mockWeather, flightSafe })
        setLoading(false)
      }, 1000)
    }

    fetchWeather()

    // Update weather every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location, onWeatherUpdate])

  const getWindDirection = (degrees: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    return directions[Math.round(degrees / 22.5) % 16]
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Clear":
        return "bg-green-100 text-green-800"
      case "Partly Cloudy":
      case "Cloudy":
        return "bg-blue-100 text-blue-800"
      case "Overcast":
        return "bg-gray-100 text-gray-800"
      case "Light Rain":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const isFlightSafe =
    weather &&
    weather.windSpeed <= 20 &&
    weather.visibility >= 5 &&
    !["Heavy Rain", "Thunderstorm", "Snow"].includes(weather.conditions)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Unable to fetch weather data</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Flight Safety Status */}
          <Alert className={isFlightSafe ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {isFlightSafe ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={isFlightSafe ? "text-green-800" : "text-red-800"}>
              {isFlightSafe
                ? "Conditions suitable for flight operations"
                : "Weather conditions may affect flight safety"}
            </AlertDescription>
          </Alert>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Temperature</span>
              </div>
              <p className="text-2xl font-bold">{weather.temperature}°C</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wind</span>
              </div>
              <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
              <p className="text-xs text-muted-foreground">{getWindDirection(weather.windDirection)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Visibility</span>
              </div>
              <p className="text-2xl font-bold">{weather.visibility} km</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Conditions</span>
              </div>
              <Badge className={getConditionColor(weather.conditions)}>{weather.conditions}</Badge>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Humidity:</span>
              <span className="ml-2 font-medium">{weather.humidity}%</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Pressure:</span>
              <span className="ml-2 font-medium">{weather.pressure} hPa</span>
            </div>
          </div>

          {/* Safety Warnings */}
          {!isFlightSafe && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-800">Safety Concerns:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {weather.windSpeed > 20 && <li>• Wind speed exceeds safe operating limits (20 km/h)</li>}
                {weather.visibility < 5 && <li>• Poor visibility conditions (minimum 5 km required)</li>}
                {["Heavy Rain", "Thunderstorm", "Snow"].includes(weather.conditions) && (
                  <li>• Adverse weather conditions present</li>
                )}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 5 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
