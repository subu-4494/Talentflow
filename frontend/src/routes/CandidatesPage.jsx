import React, { useEffect, useState } from "react";
import { getCandidates } from "../lib/api";
import { Link } from "react-router-dom";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCandidates = async () => {
    setLoading(true);
    const res = await getCandidates({ search, page: 1, pageSize: 1000 });
    setCandidates(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  if (loading) return <div className="container">Loading candidates...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Candidates</h1>
      <input
        type="text"
        placeholder="Search by name/email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />
      <div>
        {candidates.map((c) => (
          <div
            key={c.id}
            style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
          >
            <Link to={`/candidates/${c.id}`}>
              {c.name} ({c.email}) - Stage: {c.stage}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
