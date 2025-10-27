import express from "express";
import multer from "multer";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// =============================
// Multer setup (store file in memory buffer)
// =============================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =============================
// MongoDB + GridFS setup
// =============================
const client = new MongoClient(process.env.MONGO_URI);
let bucket;

async function initBucket() {
  try {
    await client.connect();
    const dbName = process.env.DB_NAME || "fileShareDB"; // optional env override
    const db = client.db(dbName);
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("✅ GridFS bucket ready in DB:", dbName);
  } catch (err) {
    console.error("❌ Error initializing GridFSBucket:", err);
  }
}
initBucket();

// =============================
// UPLOAD ROUTE
// =============================
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Number of days to keep file
    const days = parseInt(req.body.days) || 1;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + days);
    // expireAt.setMinutes(expireAt.getMinutes() + days);


    



    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { uploadedAt: new Date(), expireAt, days },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      const fileId = uploadStream.id.toString();
      const backendUrl = process.env.BASE_URL || "http://localhost:5000";
      const downloadUrl = `${backendUrl}/api/files/download/${fileId}`;

      return res.status(200).json({
        message: "✅ File uploaded successfully",
        fileId,
        filename: req.file.originalname,
        downloadUrl,
        expireAt,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      return res.status(500).json({ error: "Stream upload failed" });
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// DOWNLOAD ROUTE
// =============================
router.get("/download/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: "Bucket not initialized yet" });
    }

    const fileId = new ObjectId(req.params.id);
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];
    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", (err) => {
      console.error("❌ Download error:", err);
      res.status(500).json({ error: "Error reading file" });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ General download error:", err);
    res.status(500).json({ error: "Error downloading file" });
  }
});

export default router;
