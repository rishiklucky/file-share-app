import React, { useState } from "react";
import axios from "axios";
// import "./index.css"; // ensure CSS is imported

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
    <div className="upload-card">
      <h2 style={{color:"brown"}}>Upload Your File</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label style={{color:"teal"}}>Choose File</label>
        <input style={{backgroundColor:"transparent",border:"2",borderStyle:"solid",borderColor:"teal"}} type="file" onChange={(e) => setFile(e.target.files[0])} />

        <label style={{color:"teal"}}>Expiry (in days)</label>
        <select style={{backgroundColor:"transparent",border:"2",borderStyle:"solid",borderColor:"teal"}} value={days} onChange={(e) => setDays(e.target.value)}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <option  key={d} value={d}>
              {d} day{d > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <button style={{color:"teal",backgroundColor:"peachpuff",border:"2",borderStyle:"solid",borderColor:"teal"}} type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {result && (
        <div className="upload-result">
          <div>✅ <strong>Upload Successful!</strong></div>
          <p>
            <strong>File Name :</strong> {result.filename}
          </p>
          {/* <p>
            <strong>File ID:</strong> {result.fileId}
          </p> */}
          <p>
            <strong>Link :</strong>{" "}
            <a href={result.downloadUrl} target="_blank" rel="noreferrer">
              {result.downloadUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
