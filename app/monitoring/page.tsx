import { getMissions, getDrones } from "@/lib/actions"
import { LiveTrackingMap } from "@/components/live-tracking-map"

export default async function MonitoringPage() {
  const [missions, drones] = await Promise.all([getMissions(), getDrones()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Mission Monitoring</h1>
        <p className="text-gray-600">Real-time tracking and control of active drone missions</p>
      </div>

      <LiveTrackingMap missions={missions} drones={drones} />
    </div>
  )
}
