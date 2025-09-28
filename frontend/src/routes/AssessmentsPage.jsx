import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAssessment } from "../lib/api";

export default function AssessmentsPage() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      const res = await getAssessment(Number(jobId));
      if (!res) {
        setAssessment({ jobId: Number(jobId), sections: [] });
      } else {
        setAssessment(res);
      }
      setLoading(false);
    };
    fetchAssessment();
  }, [jobId]);

  if (loading) return <div className="container">Loading assessment...</div>;

  if (!jobId) {
    return (
      <div className="container">
        <h1 className="page-title">Assessments</h1>
        <p>Select a job from the Jobs page to manage its assessment.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Assessment for Job {jobId}</h1>

      <div style={{ marginBottom: "1rem" }}>
        <Link to={`/assessments/${jobId}/builder`}>
          <button style={{ marginRight: "1rem" }}>Open Builder</button>
        </Link>
        <Link to={`/assessments/${jobId}/take`}>
          <button>Take Assessment</button>
        </Link>
      </div>

      {assessment.sections.length === 0 ? (
        <p>No assessment added yet. Open builder to create one.</p>
      ) : (
        assessment.sections.map((section, idx) => (
          <div key={idx} className="card">
            <h3>{section.title}</h3>
            <ul>
              {section.questions.map((q) => (
                <li key={q.id}>
                  {q.text} [{q.type}]
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
