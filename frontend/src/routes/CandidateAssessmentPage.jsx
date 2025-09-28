import React, { useEffect, useState } from "react";
import { getCandidates } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    setLoading(true);
    const res = await getCandidates({ search, page: 1, pageSize: 1000 });
    setCandidates(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  if (loading)
    return <div className="container">Loading candidates...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Candidates</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by name/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "100%",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={() => navigate("/candidates/kanban")}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 6,
            border: "none",
            background: "#3498db",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          View Kanban
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {candidates.map((c) => (
          <div
            key={c.id}
            style={{
              padding: "0.8rem",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to={`/candidates/${c.id}`}
              style={{ textDecoration: "none", color: "#333", fontWeight: 500 }}
            >
              {c.name} ({c.email}) - Stage: {c.stage}
            </Link>

            <button
              onClick={() => navigate("/candidates/kanban")}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 6,
                border: "none",
                background: "#2ecc71",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Kanban
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
