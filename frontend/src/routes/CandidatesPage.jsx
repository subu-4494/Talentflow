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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading candidates...</div>;

  // Styles
  const styles = {
    container: { maxWidth: 900, margin: "2rem auto", padding: "0 1rem" },
    pageTitle: { fontSize: "2rem", fontWeight: 600, marginBottom: "1.5rem" },
    searchSection: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" },
    input: { padding: "0.5rem 0.8rem", borderRadius: 6, border: "1px solid #ccc", flex: 1, minWidth: 200 },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: 6,
      border: "none",
      backgroundColor: "#2563eb",
      color: "#fff",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    candidateCard: {
      padding: "1rem",
      marginBottom: "0.8rem",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      background: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      transition: "transform 0.1s",
    },
    candidateLink: { textDecoration: "none", color: "#1f2937" },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Candidates</h1>

      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by name/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <button
          style={styles.button}
          onClick={() => navigate("/candidates/kanban")}
          onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)}
          onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
        >
          View Kanban
        </button>
      </div>

      <div>
        {candidates.map((c) => (
          <div
            key={c.id}
            style={styles.candidateCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Link to={`/candidates/${c.id}`} style={styles.candidateLink}>
              <strong>{c.name}</strong> ({c.email}) - Stage: <span style={{ fontWeight: 500 }}>{c.stage}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
