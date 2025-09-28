import React, { useState } from "react";
import { saveResponse, getResponse } from "../lib/localStorage";

export default function AssessmentPreview({ sections, jobId }) {
  const [responses, setResponses] = useState(getResponse(jobId, "candidate1"));

  const handleChange = (qId, value) => {
    setResponses({ ...responses, [qId]: value });
  };

  const handleSave = () => {
    saveResponse(jobId, "candidate1", responses);
    alert("Responses saved locally!");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 10 }}>
      {sections.map(sec => (
        <div key={sec.id} style={{ marginBottom: 10 }}>
          <h3>{sec.title}</h3>
          {sec.questions.map(q => (
            <div key={q.id} style={{ marginBottom: 5 }}>
              <label>{q.question}{q.required ? "*" : ""}</label>
              {q.type === "short-text" && (
                <input
                  type="text"
                  value={responses[q.id] || ""}
                  onChange={e => handleChange(q.id, e.target.value)}
                />
              )}
              {q.type === "long-text" && (
                <textarea
                  value={responses[q.id] || ""}
                  onChange={e => handleChange(q.id, e.target.value)}
                />
              )}
              {q.type === "single-choice" && q.options.map((opt, idx) => (
                <div key={idx}>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={responses[q.id] === opt}
                    onChange={e => handleChange(q.id, e.target.value)}
                  /> {opt}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSave}>Save Responses</button>
    </div>
  );
}
