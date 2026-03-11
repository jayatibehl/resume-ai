import { useState } from "react";

export default function ResumeUpload({ setResult }) {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/resume/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setLoading(false);

      if (data.error) {
        alert(data.error);
        return;
      }

      setResult(data);

    } catch (err) {
      setLoading(false);
      alert("Upload failed");
    }
  };

  return (
    <div className="upload-card">
      <h2>Upload Resume</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
}