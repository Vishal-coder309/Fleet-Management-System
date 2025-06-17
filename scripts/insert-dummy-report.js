const { MongoClient, ObjectId } = require("mongodb");

// Use your actual connection string here:
const MONGODB_URI = "mongodb+srv://Vishal:root@test.azl2h.mongodb.net/?retryWrites=true&w=majority&appName=Test";
const DB_NAME = "drone_survey_system";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // Fetch a real mission and organization ID
  const mission = await db.collection("missions").findOne({});
  const organization = await db.collection("organizations").findOne({});

  if (!mission || !organization) {
    console.error("No mission or organization found in the database. Please create one first.");
    await client.close();
    return;
  }

  console.log("Using mission_id:", mission._id.toString());
  console.log("Using organization_id:", organization._id.toString());

  const dummyReport = {
    mission_id: mission._id,
    organization_id: organization._id,
    summary: {
      total_distance: 5.2,
      area_covered: 12.3,
      images_captured: 120,
      flight_duration: 30,
      battery_consumed: 25,
    },
    statistics: {
      average_altitude: 100,
      max_speed: 6,
      waypoints_completed: 3,
    },
    data_quality: {
      image_overlap_percentage: 90,
      gps_accuracy: 1.5,
      sensor_data_points: 800,
    },
    created_at: new Date(),
  };

  await db.collection("survey_reports").insertOne(dummyReport);
  console.log("Dummy report inserted. Check your Reports page!");
  await client.close();
}

main().catch(console.error); 