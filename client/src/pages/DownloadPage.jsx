import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DownloadPage(){
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) return setStatus("no-token");
    // just redirect browser to backend direct download endpoint
    // so the response is an attachment
    window.location.href = `http://localhost:5000/api/files/download/${token}`;
  }, [token]);

  if (status === "no-token") return (
    <div className="p-8 text-center">No token provided.</div>
  );

  return (
    <div className="p-8 text-center">
      Preparing download... If your browser didn't start downloading, check the link or try again.
    </div>
  );
}
