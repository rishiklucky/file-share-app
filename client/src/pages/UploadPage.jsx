import React, { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [days, setDays] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose a file.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("days", days);
      const res = await axios.post("http://localhost:5000/api/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data); // ✅ this contains { fileId, filename, downloadUrl }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload a file</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <select
            value={days}
            onChange={e => setDays(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <option key={d} value={d}>
                {d} day{d > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-green-600 font-semibold">✅ Uploaded!</div>
            <div className="mt-2">
              <div>📄 <strong>File name:</strong> {result.filename}</div>
              <div>🆔 <strong>File ID:</strong> {result.fileId}</div>
              <div>
                🔗 <strong>Download Link:</strong>{" "}
                <a
                  className="text-blue-600 underline"
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.downloadUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
