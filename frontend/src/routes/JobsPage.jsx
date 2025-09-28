import React, { useEffect, useState } from "react";
import { getJobs, archiveJob, reorderJob } from "../lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    const res = await getJobs({
      page: 1,
      pageSize: 25,
      search,
      status: statusFilter || undefined,
    });
    setJobs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter]);

  const handleArchive = async (id, status) => {
    await archiveJob(id, status === "active");
    fetchJobs();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;

    const updatedJobs = Array.from(jobs);
    const [movedJob] = updatedJobs.splice(fromIndex, 1);
    updatedJobs.splice(toIndex, 0, movedJob);
    setJobs(updatedJobs);

    try {
      await reorderJob({ fromOrder: fromIndex, toOrder: toIndex });
    } catch (err) {
      alert("Reorder failed, rolling back");
      fetchJobs();
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading jobs...</div>;

  // Styles
  const styles = {
    container: { maxWidth: 900, margin: "2rem auto", padding: "0 1rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" },
    searchSection: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    input: { padding: "0.5rem 0.8rem", borderRadius: 6, border: "1px solid #ccc", flex: 1, minWidth: 200 },
    select: { padding: "0.5rem 0.8rem", borderRadius: 6, border: "1px solid #ccc" },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: 6,
      border: "none",
      backgroundColor: "#2563eb", // professional blue
      color: "#fff",
      cursor: "pointer",
      fontWeight: 500,
      transition: "all 0.2s",
    },
    card: {
      userSelect: "none",
      padding: "1rem",
      marginBottom: "0.8rem",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      background: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" },
    cardButtons: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    badge: (status) => ({
      padding: "0.2rem 0.6rem",
      borderRadius: 6,
      color: "#fff",
      backgroundColor: status === "active" ? "#10b981" : "#6b7280",
      fontWeight: 500,
      marginLeft: "0.5rem",
    }),
    clickableArea: { cursor: "pointer", width: "100%" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Jobs</h1>
        <button
          style={styles.button}
          onClick={() => navigate("/jobs/new")}
          onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)}
          onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
        >
          Create New Job
        </button>
      </div>

      <div style={styles.searchSection}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginTop: "1rem" }}>
              {jobs.map((job, index) => (
                <Draggable key={job.id} draggableId={String(job.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...styles.card, ...provided.draggableProps.style }}
                    >
                      {/* Entire card clickable */}
                      <div
                        style={styles.clickableArea}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <div style={styles.cardHeader}>
                          <div>
                            <strong>{job.title}</strong>
                            <span style={styles.badge(job.status)}>{job.status.toUpperCase()}</span>
                          </div>
                          <div style={styles.cardButtons}>
                            <button
                              style={styles.button}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(job.id, job.status);
                              }}
                            >
                              {job.status === "active" ? "Archive" : "Unarchive"}
                            </button>
                            <button
                              style={styles.button}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/${job.id}/edit`);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              style={styles.button}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assessments/${job.id}`);
                              }}
                            >
                              Assessment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
