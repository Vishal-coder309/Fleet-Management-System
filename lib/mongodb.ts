import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = "mongodb+srv://Vishal:root@test.azl2h.mongodb.net/?retryWrites=true&w=majority&appName=Test"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("drone_survey_system")
}

export default clientPromise
