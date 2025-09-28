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

  if (loading)
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading job...</div>;

  // Styles
  const styles = {
    container: { maxWidth: 600, margin: "2rem auto", padding: "0 1rem" },
    header: { fontSize: "1.8rem", fontWeight: 600, marginBottom: "1rem" },
    form: { display: "flex", flexDirection: "column", gap: "1rem" },
    input: {
      padding: "0.6rem 0.8rem",
      borderRadius: 6,
      border: "1px solid #ccc",
      fontSize: "1rem",
    },
    button: {
      padding: "0.6rem 1.2rem",
      borderRadius: 6,
      border: "none",
      backgroundColor: "#4f46e5",
      color: "#fff",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
      alignSelf: "flex-start",
    },
    error: { color: "#dc2626", fontWeight: 500 },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{jobId ? "Edit Job" : "Create Job"}</h1>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          placeholder="Title"
          value={job.title}
          onChange={(e) => setJob({ ...job, title: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Tags (comma separated)"
          value={job.tags.join(",")}
          onChange={(e) => setJob({ ...job, tags: e.target.value.split(",") })}
          style={styles.input}
        />
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)}
          onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
        >
          Save
        </button>
      </form>
    </div>
  );
}
