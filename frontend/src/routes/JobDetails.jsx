import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobs } from "../lib/api";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      const res = await getJobs({ page: 1, pageSize: 100 });
      const found = res.data.find((j) => j.id === Number(jobId));
      setJob(found);
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  if (loading) return <div className="container">Loading job...</div>;
  if (!job) return <div className="container">Job not found</div>;

  return (
    <div className="container">
      <h1 className="page-title">{job.title}</h1>
      <p>Status: {job.status}</p>
      <p>Tags: {job.tags.join(", ")}</p>
      <p>Order: {job.order}</p>
      <button onClick={() => navigate(`/jobs/${job.id}/edit`)}>Edit Job</button>
    </div>
  );
}