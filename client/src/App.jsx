import { Routes, Route, Link } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import DownloadPage from "./pages/DownloadPage";

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between">
        {/* <div className="font-bold">FileShare</div>
        <div className="space-x-4">
          <Link to="/" className="text-blue-600">Upload</Link>
        </div> */}
      </nav>

      <Routes>
        <Route path="/" element={<UploadPage/>} />
        <Route path="/s/:token" element={<DownloadPage/>} />
      </Routes>
    </div>
  );
}
