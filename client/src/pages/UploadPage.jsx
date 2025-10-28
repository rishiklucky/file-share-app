import React, { useState } from "react";
import axios from "axios";
import "../index.css"
import "bootstrap/dist/css/bootstrap.min.css";


export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [days, setDays] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose a file first!");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("days", days);
      const res = await axios.post(
        "https://file-share-backend-lek4.onrender.com/api/files/upload",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid upload-wrapper">
      <div className="upload-card text-center">
        <h2>Upload Your File</h2>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-semibold">Choose File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-semibold">Expiry (in days)</label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="form-select"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} day{d > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn w-100 fw-semibold" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {result && (
          <div className="upload-result mt-4 text-start">
            <div> <strong>Upload Successful !</strong>✅</div>
            &nbsp;
            <p><strong>File Name:</strong> {result.filename}</p>
            <p>
              <strong>Download Link:</strong>{" "}
              <a href={result.downloadUrl} target="_blank" rel="noreferrer">
                {result.downloadUrl}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
