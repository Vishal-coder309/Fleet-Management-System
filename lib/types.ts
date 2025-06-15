import type { ObjectId } from "mongodb"

export interface Drone {
  _id?: ObjectId
  name: string
  model: string
  organization_id: ObjectId
  status: "available" | "in_mission" | "maintenance" | "charging"
  battery_level: number
  location: {
    lat: number
    lng: number
    altitude: number
  }
  capabilities: string[]
  max_flight_time: number
  sensors: string[]
  serial_number: string
  firmware_version: string
  created_at: Date
  updated_at?: Date
}

export interface Mission {
  _id?: ObjectId
  name: string
  drone_id: ObjectId
  organization_id: ObjectId
  site_id?: ObjectId
  status: "planned" | "in_progress" | "completed" | "aborted" | "paused"
  mission_type: "inspection" | "mapping" | "surveillance"
  flight_pattern: "perimeter" | "crosshatch" | "custom"
  parameters: {
    altitude: number
    speed: number
    overlap_percentage: number
    sensor_frequency: number
    sensors_enabled: string[]
  }
  flight_path: Array<{
    lat: number
    lng: number
    altitude: number
  }>
  survey_area?: {
    type: "polygon"
    coordinates: Array<[number, number]>
  }
  progress: number
  estimated_duration: number
  elapsed_time: number
  weather_conditions?: {
    wind_speed: number
    visibility: number
    temperature: number
  }
  safety_checks: {
    no_fly_zone_clear: boolean
    weather_acceptable: boolean
    battery_sufficient: boolean
  }
  created_at: Date
  started_at?: Date
  completed_at?: Date
  updated_at?: Date
}

export interface Organization {
  _id?: ObjectId
  name: string
  created_at: Date
  settings: {
    max_concurrent_missions: number
    default_flight_altitude: number
    safety_buffer_distance: number
    max_wind_speed: number
  }
}

export interface SurveyReport {
  _id?: ObjectId
  mission_id: ObjectId
  organization_id: ObjectId
  summary: {
    total_distance: number
    area_covered: number
    images_captured: number
    flight_duration: number
    battery_consumed: number
  }
  statistics: {
    average_altitude: number
    max_speed: number
    waypoints_completed: number
  }
  data_quality: {
    image_overlap_percentage: number
    gps_accuracy: number
    sensor_data_points: number
  }
  created_at: Date
}

export interface Site {
  _id?: ObjectId
  name: string
  location: {
    lat: number
    lng: number
  }
  boundaries: Array<{
    lat: number
    lng: number
  }>
  no_fly_zones: Array<{
    name: string
    coordinates: Array<{
      lat: number
      lng: number
    }>
  }>
  organization_id: ObjectId
  created_at: Date
}
