// server/routes/upload.js
import express from "express";
import multer from "multer";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB Connection
let bucket;
const client = new MongoClient(process.env.MONGO_URI);

async function initBucket() {
  await client.connect();
  const db = client.db("fileShareDB"); // <-- change name if needed
  bucket = new GridFSBucket(db, { bucketName: "uploads" });
  console.log("✅ GridFS bucket initialized");
}

initBucket();

// =============================
// UPLOAD ROUTE
// =============================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      const fileId = uploadStream.id.toString();
      const downloadUrl = `${process.env.BASE_URL}/api/download/${fileId}`;

      res.status(200).json({
        message: "✅ File uploaded successfully",
        fileId,
        filename: req.file.originalname,
        downloadUrl, // 👈 this is what we’ll use on frontend
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (err) {
    console.error("Error in upload route:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// DOWNLOAD ROUTE
// =============================
router.get("/download/:id", async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0)
      return res.status(404).json({ error: "File not found" });

    res.set({
      "Content-Type": files[0].contentType,
      "Content-Disposition": `attachment; filename="${files[0].filename}"`,
    });

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Error downloading file" });
  }
});

export default router;
