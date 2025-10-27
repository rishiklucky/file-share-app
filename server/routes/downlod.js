import express from "express";
import mongoose from "mongoose";
import Grid from "gridfs-stream";
import File from "../models/File.js";

const router = express.Router();

let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// route: GET /api/download/:token
router.get("/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const doc = await File.findOne({ token });
    if (!doc) return res.status(404).json({ error: "Not found or expired" });

    // check expiry
    if (new Date() > doc.expireAt) {
      // expired: remove metadata & gridfs file (cleanup job will also handle)
      try { await gfs.remove({ _id: doc.gridFsFileId, root: "uploads" }); } catch(e){/*ignore*/ }
      await File.deleteOne({ _id: doc._id });
      return res.status(410).json({ error: "File expired" });
    }

    // stream from GridFS
    const readstream = gfs.createReadStream({ _id: doc.gridFsFileId, root: "uploads" });

    // set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${doc.filename}"`);
    res.setHeader("Content-Type", doc.mimetype || "application/octet-stream");

    readstream.on("error", (err) => {
      console.error("gridfs read err:", err);
      res.status(500).end();
    });

    readstream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
