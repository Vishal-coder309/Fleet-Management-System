"use server"

import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import type { Mission, SurveyReport, Drone } from "./types"

export async function getDrones() {
  try {
    const db = await getDatabase()
    const drones = await db.collection("drones").find({}).toArray()
    return JSON.parse(JSON.stringify(drones))
  } catch (error) {
    console.error("Error fetching drones:", error)
    return []
  }
}

export async function addDrone(droneData: Omit<Drone, "_id" | "created_at">) {
  try {
    const db = await getDatabase()

    const drone = {
      ...droneData,
      organization_id:
        typeof droneData.organization_id === "string"
          ? new ObjectId(droneData.organization_id)
          : droneData.organization_id,
      created_at: new Date(),
    }

    const result = await db.collection("drones").insertOne(drone)
    revalidatePath("/fleet")
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error adding drone:", error)
    throw new Error("Failed to add drone")
  }
}

export async function updateDroneStatus(droneId: string, status: Drone["status"], batteryLevel?: number) {
  try {
    const db = await getDatabase()

    const updateData: any = {
      status,
      updated_at: new Date(),
    }

    if (batteryLevel !== undefined) {
      updateData.battery_level = batteryLevel
    }

    await db.collection("drones").updateOne({ _id: new ObjectId(droneId) }, { $set: updateData })

    revalidatePath("/fleet")
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating drone status:", error)
    throw new Error("Failed to update drone status")
  }
}

export async function updateDroneLocation(droneId: string, location: { lat: number; lng: number; altitude: number }) {
  try {
    const db = await getDatabase()

    await db.collection("drones").updateOne(
      { _id: new ObjectId(droneId) },
      {
        $set: {
          location,
          updated_at: new Date(),
        },
      },
    )

    revalidatePath("/monitoring")
  } catch (error) {
    console.error("Error updating drone location:", error)
  }
}

export async function getMissions() {
  try {
    const db = await getDatabase()
    const missions = await db
      .collection("missions")
      .aggregate([
        {
          $lookup: {
            from: "drones",
            localField: "drone_id",
            foreignField: "_id",
            as: "drone",
          },
        },
        {
          $unwind: "$drone",
        },
        {
          $sort: { created_at: -1 },
        },
      ])
      .toArray()
    return JSON.parse(JSON.stringify(missions))
  } catch (error) {
    console.error("Error fetching missions:", error)
    return []
  }
}

export async function createMission(missionData: Omit<Mission, "_id" | "created_at" | "progress" | "elapsed_time">) {
  try {
    const db = await getDatabase()

    // Convert string IDs to ObjectId
    const droneObjectId =
      typeof missionData.drone_id === "string" ? new ObjectId(missionData.drone_id) : missionData.drone_id

    const orgObjectId =
      typeof missionData.organization_id === "string"
        ? new ObjectId(missionData.organization_id)
        : missionData.organization_id

    // Update drone status to in_mission
    await db
      .collection("drones")
      .updateOne({ _id: droneObjectId }, { $set: { status: "in_mission", updated_at: new Date() } })

    const mission = {
      ...missionData,
      drone_id: droneObjectId,
      organization_id: orgObjectId,
      progress: 0,
      elapsed_time: 0,
      created_at: new Date(),
    }

    const result = await db.collection("missions").insertOne(mission)
    revalidatePath("/")
    revalidatePath("/missions")
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error creating mission:", error)
    throw new Error("Failed to create mission")
  }
}

export async function updateMissionStatus(missionId: string, status: Mission["status"]) {
  try {
    const db = await getDatabase()

    const updateData: any = {
      status,
      updated_at: new Date(),
    }

    if (status === "in_progress") {
      updateData.started_at = new Date()
    } else if (status === "completed" || status === "aborted") {
      updateData.completed_at = new Date()
    }

    // First update the mission status
    await db.collection("missions").updateOne({ _id: new ObjectId(missionId) }, { $set: updateData })

    // Then handle post-status-update operations
    if (status === "completed" || status === "aborted") {
      // Update drone status back to available
      const mission = await db.collection("missions").findOne({ _id: new ObjectId(missionId) })
      if (mission) {
        await db
          .collection("drones")
          .updateOne({ _id: mission.drone_id }, { $set: { status: "available", updated_at: new Date() } })
      }

      // Auto-generate survey report for completed or aborted missions
      await createSurveyReport(missionId)
    }

    revalidatePath("/")
    revalidatePath("/missions")
    revalidatePath("/monitoring")
  } catch (error) {
    console.error("Error updating mission status:", error)
    throw new Error("Failed to update mission status")
  }
}

export async function updateMissionProgress(missionId: string, progress: number, elapsedTime: number) {
  try {
    const db = await getDatabase()

    await db.collection("missions").updateOne(
      { _id: new ObjectId(missionId) },
      {
        $set: {
          progress,
          elapsed_time: elapsedTime,
          updated_at: new Date(),
        },
      },
    )

    revalidatePath("/")
    revalidatePath("/monitoring")
  } catch (error) {
    console.error("Error updating mission progress:", error)
  }
}

export async function getSurveyReports() {
  try {
    const db = await getDatabase()
    const reports = await db
      .collection("survey_reports")
      .aggregate([
        {
          $lookup: {
            from: "missions",
            localField: "mission_id",
            foreignField: "_id",
            as: "mission",
          },
        },
        {
          $unwind: "$mission",
        },
        {
          $lookup: {
            from: "drones",
            localField: "mission.drone_id",
            foreignField: "_id",
            as: "drone",
          },
        },
        {
          $unwind: "$drone",
        },
        {
          $sort: { created_at: -1 },
        },
      ])
      .toArray()
    return JSON.parse(JSON.stringify(reports))
  } catch (error) {
    console.error("Error fetching survey reports:", error)
    return []
  }
}

export async function getOrganizationStats() {
  try {
    const db = await getDatabase()

    const totalDrones = await db.collection("drones").countDocuments()
    const activeMissions = await db.collection("missions").countDocuments({
      status: { $in: ["in_progress", "planned"] },
    })
    const completedMissions = await db.collection("missions").countDocuments({ status: "completed" })
    const totalFlightTime = await db
      .collection("missions")
      .aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$elapsed_time" } } }])
      .toArray()

    // Additional analytics
    const missionsByType = await db
      .collection("missions")
      .aggregate([{ $group: { _id: "$mission_type", count: { $sum: 1 } } }])
      .toArray()

    const dronesByStatus = await db
      .collection("drones")
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .toArray()

    return {
      totalDrones,
      activeMissions,
      completedMissions,
      totalFlightTime: totalFlightTime[0]?.total || 0,
      missionsByType: missionsByType.reduce((acc: any, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      dronesByStatus: dronesByStatus.reduce((acc: any, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
    }
  } catch (error) {
    console.error("Error fetching organization stats:", error)
    return {
      totalDrones: 0,
      activeMissions: 0,
      completedMissions: 0,
      totalFlightTime: 0,
      missionsByType: {},
      dronesByStatus: {},
    }
  }
}

export async function createSurveyReport(missionId: string) {
  try {
    const db = await getDatabase()

    const mission = await db.collection("missions").findOne({ _id: new ObjectId(missionId) })
    if (!mission || (mission.status !== "completed" && mission.status !== "aborted")) {
      throw new Error("Mission not found or not completed/aborted")
    }

    // Check if report already exists
    const existingReport = await db.collection("survey_reports").findOne({ mission_id: new ObjectId(missionId) })
    if (existingReport) {
      return existingReport._id.toString()
    }

    // Generate mock survey report data
    const report: Omit<SurveyReport, "_id"> = {
      mission_id: new ObjectId(missionId),
      organization_id: mission.organization_id,
      summary: {
        total_distance: Math.round((Math.random() * 5 + 1) * 100) / 100,
        area_covered: Math.round((Math.random() * 20 + 5) * 100) / 100,
        images_captured: Math.floor(Math.random() * 300 + 50),
        flight_duration: mission.elapsed_time,
        battery_consumed: Math.floor(Math.random() * 40 + 20),
      },
      statistics: {
        average_altitude: mission.parameters.altitude,
        max_speed: Math.round(mission.parameters.speed * 1.2 * 100) / 100,
        waypoints_completed: mission.flight_path.length,
      },
      data_quality: {
        image_overlap_percentage: Math.floor(Math.random() * 21) + 80, // 80-100%
        gps_accuracy: Math.round((Math.random() * 2 + 1) * 10) / 10, // 1.0-3.0
        sensor_data_points: Math.floor(Math.random() * 1000 + 500), // 500-1500
      },
      created_at: new Date(),
    }

    const result = await db.collection("survey_reports").insertOne(report)
    revalidatePath("/reports")
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error creating survey report:", error)
    throw new Error("Failed to create survey report")
  }
}

// Simulate real-time mission progress updates
export async function simulateMissionProgress() {
  try {
    const db = await getDatabase()

    // Get all in-progress missions
    const activeMissions = await db
      .collection("missions")
      .find({
        status: "in_progress",
      })
      .toArray()

    for (const mission of activeMissions) {
      // Simulate progress increment
      const newProgress = Math.min(mission.progress + Math.random() * 5, 100)
      const newElapsedTime = mission.elapsed_time + 1

      // Update mission progress
      await db.collection("missions").updateOne(
        { _id: mission._id },
        {
          $set: {
            progress: newProgress,
            elapsed_time: newElapsedTime,
            updated_at: new Date(),
          },
        },
      )

      // Simulate drone movement along flight path
      if (mission.flight_path && mission.flight_path.length > 0) {
        const pathIndex = Math.floor((newProgress / 100) * mission.flight_path.length)
        const currentWaypoint = mission.flight_path[Math.min(pathIndex, mission.flight_path.length - 1)]

        // Add some random variation to simulate realistic movement
        const location = {
          lat: currentWaypoint.lat + (Math.random() - 0.5) * 0.0001,
          lng: currentWaypoint.lng + (Math.random() - 0.5) * 0.0001,
          altitude: currentWaypoint.altitude + (Math.random() - 0.5) * 5,
        }

        await updateDroneLocation(mission.drone_id.toString(), location)
      }

      // Complete mission if progress reaches 100% or elapsed time exceeds estimated duration
      if (newProgress >= 100 || newElapsedTime >= mission.estimated_duration) {
        await updateMissionStatus(mission._id.toString(), "completed")
      }
    }

    // Simulate battery drain for active drones
    const activeDrones = await db
      .collection("drones")
      .find({
        status: "in_mission",
      })
      .toArray()

    for (const drone of activeDrones) {
      const batteryDrain = Math.random() * 2 // 0-2% drain per update
      const newBatteryLevel = Math.max(drone.battery_level - batteryDrain, 0)

      await updateDroneStatus(drone._id.toString(), drone.status, newBatteryLevel)

      // Auto-land if battery is critically low
      if (newBatteryLevel < 15) {
        const mission = await db.collection("missions").findOne({
          drone_id: drone._id,
          status: "in_progress",
        })
        if (mission) {
          await updateMissionStatus(mission._id.toString(), "aborted")
        }
      }
    }

    revalidatePath("/")
    revalidatePath("/monitoring")
    revalidatePath("/fleet")
  } catch (error) {
    console.error("Error simulating mission progress:", error)
  }
}

export async function getSites() {
  try {
    const db = await getDatabase()
    const sites = await db.collection("sites").find({}).toArray()
    return JSON.parse(JSON.stringify(sites))
  } catch (error) {
    console.error("Error fetching sites:", error)
    return []
  }
}

export async function addSite(siteData: any) {
  try {
    const db = await getDatabase()

    const site = {
      ...siteData,
      created_at: new Date(),
    }

    const result = await db.collection("sites").insertOne(site)
    revalidatePath("/sites")
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error adding site:", error)
    throw new Error("Failed to add site")
  }
}
