import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  gridFsFileId: { type: mongoose.Types.ObjectId, required: true }, // object id of file stored in GridFS
  mimetype: String,
  size: Number,
  token: { type: String, unique: true, index: true },
  expireAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.File || mongoose.model("File", FileSchema);
