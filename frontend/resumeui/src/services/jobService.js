export const matchJobs = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:5000/api/jobs/match", {
    method: "POST",
    body: formData,
  });

  return await res.json();
};