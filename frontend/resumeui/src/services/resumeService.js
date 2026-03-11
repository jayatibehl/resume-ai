export const uploadResume = async (file) => {

  const formData = new FormData();
  formData.append("file", file);   // 🔥 IMPORTANT → backend expects "file"

  try {
    const res = await fetch("http://127.0.0.1:5000/api/resume/upload", {
      method: "POST",
      body: formData,
    });

    return await res.json();

  } catch (err) {
    return { error: "Backend not connected" };
  }
};