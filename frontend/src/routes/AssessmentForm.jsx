import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssessment, submitAssessment } from "../lib/api";

export default function AssessmentForm() {
  const { jobId, candidateId } = useParams(); // candidateId optional if needed
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchAssessment = async () => {
      const res = await getAssessment(Number(jobId));
      if (res) setAssessment(res);
      setLoading(false);
    };
    fetchAssessment();
  }, [jobId]);

  const handleChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const checkConditional = (q) => {
    if (!q.conditional) return true;
    const { questionId, value } = q.conditional;
    return responses[questionId] === value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    for (const section of assessment.sections) {
      for (const q of section.questions) {
        if (!checkConditional(q)) continue;
        const answer = responses[q.id];
        if (q.required && (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0))) {
          alert(`Please answer required question: "${q.text}"`);
          return;
        }
        if (q.type === "numeric") {
          if (q.validation?.min !== undefined && answer < q.validation.min) {
            alert(`Answer for "${q.text}" must be >= ${q.validation.min}`);
            return;
          }
          if (q.validation?.max !== undefined && answer > q.validation.max) {
            alert(`Answer for "${q.text}" must be <= ${q.validation.max}`);
            return;
          }
        }
        if ((q.type === "short_text" || q.type === "long_text") && q.validation?.maxLength) {
          if (answer.length > q.validation.maxLength) {
            alert(`Answer for "${q.text}" exceeds max length of ${q.validation.maxLength}`);
            return;
          }
        }
      }
    }

    // Submit responses
    await submitAssessment(Number(jobId), candidateId || "guest", responses);
    alert("Assessment submitted successfully!");
  };

  if (loading) return <div className="container">Loading assessment...</div>;
  if (!assessment) return <div className="container">Assessment not found</div>;

  return (
    <div className="container">
      <h1 className="page-title">Assessment Form - Job {jobId}</h1>
      <form onSubmit={handleSubmit}>
        {assessment.sections.map(section => (
          <div key={section.id} className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <h3>{section.title}</h3>
            {section.questions.map(q => checkConditional(q) && (
              <div key={q.id} style={{ marginBottom: "0.5rem" }}>
                <label>{q.text} {q.required && "*"}</label><br/>

                {q.type === "short_text" && (
                  <input
                    type="text"
                    value={responses[q.id] || ""}
                    maxLength={q.validation?.maxLength}
                    required={q.required}
                    onChange={e => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "long_text" && (
                  <textarea
                    value={responses[q.id] || ""}
                    maxLength={q.validation?.maxLength}
                    required={q.required}
                    onChange={e => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "numeric" && (
                  <input
                    type="number"
                    value={responses[q.id] || ""}
                    min={q.validation?.min}
                    max={q.validation?.max}
                    required={q.required}
                    onChange={e => handleChange(q.id, e.target.valueAsNumber)}
                  />
                )}

                {q.type === "single_choice" && q.options.map((opt, idx) => (
                  <label key={idx} style={{ marginRight: "1rem" }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={responses[q.id] === opt}
                      onChange={e => handleChange(q.id, e.target.value)}
                      required={q.required}
                    /> {opt}
                  </label>
                ))}

                {q.type === "multi_choice" && q.options.map((opt, idx) => (
                  <label key={idx} style={{ marginRight: "1rem" }}>
                    <input
                      type="checkbox"
                      name={q.id}
                      value={opt}
                      checked={responses[q.id]?.includes(opt) || false}
                      onChange={e => {
                        const prev = responses[q.id] || [];
                        if (e.target.checked) handleChange(q.id, [...prev, opt]);
                        else handleChange(q.id, prev.filter(v => v !== opt));
                      }}
                    /> {opt}
                  </label>
                ))}

                {q.type === "file_upload" && (
                  <input
                    type="file"
                    onChange={e => handleChange(q.id, e.target.files[0])}
                    required={q.required}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <button type="submit" style={{ marginTop: "1rem" }}>Submit Assessment</button>
      </form>
    </div>
  );
}
