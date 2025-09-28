import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobs, createJob, updateJob } from "../lib/api";
import { slugify } from "../utilis/slugify";

export default function JobForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({ title: "", tags: [] });
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState("");

  // Fetch job data if editing
  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        const res = await getJobs({ page: 1, pageSize: 100 });
        const found = res.data.find((j) => j.id === Number(jobId));
        if (found) setJob({ title: found.title, tags: found.tags || [] });
        setLoading(false);
      };
      fetchJob();
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!job.title.trim()) {
      setError("Title is required");
      return;
    }

    const allJobs = await getJobs({ page: 1, pageSize: 100 });
    if (
      allJobs.data.some(
        (j) => slugify(j.title) === slugify(job.title) && j.id !== Number(jobId)
      )
    ) {
      setError("Slug must be unique");
      return;
    }

    try {
      const payload = {
        title: job.title,
        slug: slugify(job.title),
        tags: job.tags,
      };

      if (jobId) {
        await updateJob(Number(jobId), payload); // Edit
      } else {
        await createJob(payload); // Create
      }

      navigate("/jobs"); // Redirect after save
    } catch (err) {
      console.error(err);
      setError("Failed to save job");
    }
  };

  if (loading) return <div className="container">Loading job...</div>;

  return (
    <div className="container">
      <h1>{jobId ? "Edit Job" : "Create Job"}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={job.title}
          onChange={(e) => setJob({ ...job, title: e.target.value })}
          style={{ display: "block", marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
        />
        <input
          placeholder="Tags (comma separated)"
          value={job.tags.join(",")}
          onChange={(e) => setJob({ ...job, tags: e.target.value.split(",") })}
          style={{ display: "block", marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Save
        </button>
      </form>
    </div>
  );
}
