import React, { useState } from "react";
import { getCandidateResponsesByEmail, getAssessment } from "../lib/api";

export default function CandidateResponsesByEmail() {
  const [email, setEmail] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!email.trim()) return;
    setLoading(true);

    // Get all jobs where candidate has responses
    const jobs = JSON.parse(localStorage.getItem("candidateResponses")) || [];
    const jobIds = [
      ...new Set(
        jobs.filter((r) => r.email === email).map((r) => Number(r.jobId))
      ),
    ];

    const results = [];
    for (const jobId of jobIds) {
      const jobResponses = getCandidateResponsesByEmail(email, jobId);
      const assessment = await getAssessment(jobId);
      results.push({ jobId, assessment, responses: jobResponses });
    }

    setResponses(results);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "1rem" }}>
        Candidate Responses by Email
      </h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="email"
          placeholder="Enter candidate email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.5rem 0.8rem",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "70%",
            maxWidth: 400,
          }}
        />
        <button
          onClick={handleFetch}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Fetch Responses
        </button>
      </div>

      {loading && <p>Loading responses...</p>}

      {responses.length === 0 && !loading && (
        <p>No responses found for this email.</p>
      )}

      {responses.map((r) => (
        <div
          key={r.jobId}
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#f9f9f9",
          }}
        >
          <h2>Job ID: {r.jobId}</h2>

          {r.responses.map((resp, idx) => (
            <div
              key={idx}
              style={{
                marginTop: "1rem",
                padding: "0.8rem",
                border: "1px solid #ccc",
                borderRadius: 6,
                background: "#fff",
              }}
            >
              <p>
                <strong>Submitted at:</strong>{" "}
                {new Date(resp.timestamp).toLocaleString()}
              </p>

              {r.assessment ? (
                r.assessment.sections.map((section, sIdx) => (
                  <div key={sIdx} style={{ marginTop: "0.8rem" }}>
                    <h3>{section.title}</h3>
                    {section.questions.map((q) => (
                      <div key={q.id} style={{ marginBottom: "0.5rem" }}>
                        <strong>{q.text}</strong>:{" "}
                        {Array.isArray(resp.responses[q.id])
                          ? resp.responses[q.id].join(", ")
                          : resp.responses[q.id] || "Not answered"}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p>No assessment found for this job.</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

