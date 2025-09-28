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

  if (loading) return <div className="container">Loading responses...</div>;
  if (!assessment) return <div className="container">Assessment not found</div>;

  return (
    <div className="container">
      <h1 className="page-title">
        Responses for Candidate {candidateId} - Job {jobId}
      </h1>

      {assessment.sections.map((section, sIdx) => (
        <div key={sIdx} className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h3>{section.title}</h3>
          {section.questions.map((q, qIdx) => (
            <div key={q.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{q.text}</strong>:{" "}
              <span>
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
