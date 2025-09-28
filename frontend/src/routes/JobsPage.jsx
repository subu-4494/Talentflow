import React, { useEffect, useState } from "react";
import { getJobs, archiveJob, reorderJob } from "../lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // active / archived / ""
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

    // Optimistic update
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

  if (loading) return <div className="container">Loading jobs...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Jobs</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={() => navigate("/jobs/new")}>Create New Job</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {jobs.map((job, index) => (
                <Draggable key={job.id} draggableId={String(job.id)} index={index}>
                  {(provided) => (
                    <div
                      className="card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: 16,
                        margin: "0 0 8px 0",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        background: "#fff",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong>{job.title}</strong> [{job.status}]
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => handleArchive(job.id, job.status)}>
                            {job.status === "active" ? "Archive" : "Unarchive"}
                          </button>
                          <button onClick={() => navigate(`/jobs/${job.id}/edit`)}>
                            Edit
                          </button>
                          <button onClick={() => navigate(`/assessments/${job.id}`)}>
                            Assessment
                          </button>
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
