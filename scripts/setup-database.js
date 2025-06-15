import { MongoClient } from "mongodb"

const MONGODB_URI = "mongodb+srv://Vishal:root@test.azl2h.mongodb.net/?retryWrites=true&w=majority&appName=Test"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("drone_survey_system")

    // Drop existing collections to start fresh
    try {
      await db.collection("drones").drop()
      await db.collection("missions").drop()
      await db.collection("organizations").drop()
      await db.collection("survey_reports").drop()
    } catch (error) {
      // Collections might not exist, ignore error
    }

    // Create collections
    await db.createCollection("drones")
    await db.createCollection("missions")
    await db.createCollection("organizations")
    await db.createCollection("survey_reports")

    // Create indexes for better performance
    await db.collection("drones").createIndex({ organization_id: 1, status: 1 })
    await db.collection("missions").createIndex({ drone_id: 1, status: 1, created_at: -1 })
    await db.collection("survey_reports").createIndex({ mission_id: 1 })

    // Seed initial data
    const organization = await db.collection("organizations").insertOne({
      name: "FlytBase Corp",
      created_at: new Date(),
      settings: {
        max_concurrent_missions: 10,
        default_flight_altitude: 100,
      },
    })

    const orgId = organization.insertedId

    // Seed drones
    const drones = [
      {
        name: "Surveyor-01",
        model: "DJI Matrice 300",
        organization_id: orgId,
        status: "available",
        battery_level: 85,
        location: { lat: 37.7749, lng: -122.4194, altitude: 0 },
        capabilities: ["mapping", "inspection", "surveillance"],
        max_flight_time: 45,
        created_at: new Date(),
      },
      {
        name: "Inspector-02",
        model: "DJI Phantom 4 Pro",
        organization_id: orgId,
        status: "in_mission",
        battery_level: 62,
        location: { lat: 37.7849, lng: -122.4094, altitude: 120 },
        capabilities: ["inspection", "photography"],
        max_flight_time: 30,
        created_at: new Date(),
      },
      {
        name: "Mapper-03",
        model: "Autel EVO II Pro",
        organization_id: orgId,
        status: "available",
        battery_level: 91,
        location: { lat: 37.7649, lng: -122.4294, altitude: 0 },
        capabilities: ["mapping", "thermal_imaging"],
        max_flight_time: 40,
        created_at: new Date(),
      },
      {
        name: "Guardian-04",
        model: "DJI Matrice 30T",
        organization_id: orgId,
        status: "maintenance",
        battery_level: 0,
        location: { lat: 37.7549, lng: -122.4394, altitude: 0 },
        capabilities: ["surveillance", "thermal_imaging", "night_vision"],
        max_flight_time: 41,
        created_at: new Date(),
      },
      {
        name: "Scout-05",
        model: "Parrot ANAFI USA",
        organization_id: orgId,
        status: "available",
        battery_level: 78,
        location: { lat: 37.7949, lng: -122.3994, altitude: 0 },
        capabilities: ["surveillance", "inspection"],
        max_flight_time: 32,
        created_at: new Date(),
      },
    ]

    const droneResult = await db.collection("drones").insertMany(drones)
    const droneIds = Object.values(droneResult.insertedIds)

    // Seed missions
    const missions = [
      {
        name: "Facility Perimeter Inspection",
        drone_id: droneIds[1],
        organization_id: orgId,
        status: "in_progress",
        mission_type: "inspection",
        flight_pattern: "perimeter",
        parameters: {
          altitude: 80,
          speed: 5,
          overlap_percentage: 70,
          sensor_frequency: 2,
        },
        flight_path: [
          { lat: 37.7849, lng: -122.4094, altitude: 80 },
          { lat: 37.7859, lng: -122.4084, altitude: 80 },
          { lat: 37.7869, lng: -122.4094, altitude: 80 },
          { lat: 37.7859, lng: -122.4104, altitude: 80 },
        ],
        progress: 65,
        estimated_duration: 25,
        elapsed_time: 16,
        created_at: new Date(Date.now() - 16 * 60 * 1000),
        started_at: new Date(Date.now() - 16 * 60 * 1000),
      },
      {
        name: "Site Mapping Survey",
        drone_id: droneIds[0],
        organization_id: orgId,
        status: "completed",
        mission_type: "mapping",
        flight_pattern: "crosshatch",
        parameters: {
          altitude: 120,
          speed: 8,
          overlap_percentage: 80,
          sensor_frequency: 1,
        },
        flight_path: [
          { lat: 37.7749, lng: -122.4194, altitude: 120 },
          { lat: 37.7759, lng: -122.4184, altitude: 120 },
          { lat: 37.7769, lng: -122.4194, altitude: 120 },
        ],
        progress: 100,
        estimated_duration: 35,
        elapsed_time: 33,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completed_at: new Date(Date.now() - 90 * 60 * 1000),
      },
    ]

    const missionResult = await db.collection("missions").insertMany(missions)
    const missionIds = Object.values(missionResult.insertedIds)

    // Seed survey reports
    const reports = [
      {
        mission_id: missionIds[1],
        organization_id: orgId,
        summary: {
          total_distance: 2.8,
          area_covered: 15.6,
          images_captured: 247,
          flight_duration: 33,
          battery_consumed: 28,
        },
        statistics: {
          average_altitude: 120,
          max_speed: 12,
          waypoints_completed: 24,
        },
        created_at: new Date(Date.now() - 90 * 60 * 1000),
      },
    ]

    await db.collection("survey_reports").insertMany(reports)

    console.log("Database setup completed successfully!")
    console.log(`Organization ID: ${orgId}`)
    console.log(`Drones created: ${droneIds.length}`)
    console.log(`Missions created: ${missionIds.length}`)
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
