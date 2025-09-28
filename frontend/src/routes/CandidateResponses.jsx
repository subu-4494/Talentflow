import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssessment, getCandidateResponses } from "../lib/api";

export default function CandidateResponses() {
  const { jobId, candidateId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const assmt = await getAssessment(Number(jobId));
      const resps = await getCandidateResponses(Number(candidateId), Number(jobId));

      setAssessment(assmt);
      setResponses(resps.length > 0 ? resps[resps.length - 1].responses : {});
      setLoading(false);
    };
    fetchData();
  }, [jobId, candidateId]);

  if (loading) return <div className="container" style={{ textAlign: "center", padding: "2rem" }}>Loading responses...</div>;
  if (!assessment) return <div className="container" style={{ textAlign: "center", padding: "2rem" }}>Assessment not found</div>;

  return (
    <div className="container" style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 className="page-title" style={{ marginBottom: "2rem" }}>
        Candidate Responses - Job {jobId}
      </h1>

      {assessment.sections.map((section, sIdx) => (
        <div key={sIdx} style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          background: "#fff"
        }}>
          <h2 style={{ marginBottom: "1rem", color: "#1f2937" }}>{section.title}</h2>
          {section.questions.map((q) => (
            <div key={q.id} style={{
              marginBottom: "0.75rem",
              padding: "0.5rem",
              borderBottom: "1px solid #f3f4f6",
            }}>
              <strong style={{ display: "block", marginBottom: "0.25rem", color: "#111827" }}>{q.text}</strong>
              <span style={{
                color: "#374151",
                background: "#f3f4f6",
                padding: "0.25rem 0.5rem",
                borderRadius: 4,
                display: "inline-block",
                minWidth: 100
              }}>
                {q.type === "file_upload" && responses[q.id]
                  ? responses[q.id].name
                  : Array.isArray(responses[q.id])
                  ? responses[q.id].join(", ")
                  : responses[q.id] || "Not answered"}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
