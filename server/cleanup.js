import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

export async function startCleanup() {
  await client.connect();
  const dbName = process.env.DB_NAME || "fileShareDB";
  const db = client.db(dbName);
  const bucket = new GridFSBucket(db, { bucketName: "uploads" });

  console.log("🧹 Auto-cleanup scheduler started");

  // Check every 1 hour
  setInterval(async () => {
    try {
      const now = new Date();

      // ✅ Find files where expireAt <= now
      const expiredFiles = await db
        .collection("uploads.files")
        .find({ "metadata.expireAt": { $lte: now } })
        .toArray();

      for (const file of expiredFiles) {
        await bucket.delete(file._id);
        console.log(`🗑️ Deleted expired file: ${file.filename} (expired on ${file.metadata.expireAt})`);
      }
    } catch (err) {
      console.error("❌ Cleanup error:", err);
    }
  }, 60 * 60 * 1000); // every 1 hour
//   },  60 * 1000); // every 1 minute
}
