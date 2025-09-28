import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssessment, saveAssessment } from "../lib/api";
import { v4 as uuidv4 } from "uuid";

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState({ jobId: Number(jobId), sections: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      const res = await getAssessment(Number(jobId));
      if (res) setAssessment({ jobId: Number(jobId), sections: res.sections });
      setLoading(false);
    };
    fetchAssessment();
  }, [jobId]);

  // ===== Sections =====
  const addSection = () => {
    setAssessment(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: uuidv4(), title: `New Section ${prev.sections.length + 1}`, questions: [] },
      ],
    }));
  };

  const updateSectionTitle = (sectionId, title) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, title } : s)
    }));
  };

  const removeSection = (sectionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  // ===== Questions =====
  const addQuestion = (sectionId, type = "short_text") => {
    const newQuestion = {
      id: uuidv4(),
      type,
      text: "New Question",
      options: type.includes("choice") ? ["Option 1"] : [],
      required: false,
      validation: {},
      conditional: null
    };
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        questions: [...s.questions, newQuestion]
      } : s)
    }));
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
      } : s)
    }));
  };

  const removeQuestion = (sectionId, questionId) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        questions: s.questions.filter(q => q.id !== questionId)
      } : s)
    }));
  };

  const handleSave = async () => {
    await saveAssessment(Number(jobId), assessment.sections);
    alert("Assessment saved!");
  };

  if (loading) return <div className="container">Loading builder...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Assessment Builder for Job {jobId}</h1>
      <button onClick={addSection} style={{ marginBottom: "1rem" }}>Add Section</button>

      {assessment.sections.map((section) => (
        <div key={section.id} className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <input
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}
          />
          <button onClick={() => removeSection(section.id)}>Delete Section</button>

          <div style={{ marginTop: "0.5rem" }}>
            {section.questions.map(q => (
              <div key={q.id} style={{ padding: "0.5rem", border: "1px solid #ccc", marginBottom: "0.5rem" }}>
                <input
                  value={q.text}
                  onChange={(e) => updateQuestion(section.id, q.id, { text: e.target.value })}
                  style={{ width: "70%" }}
                />
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(section.id, q.id, { type: e.target.value })}
                >
                  <option value="short_text">Short Text</option>
                  <option value="long_text">Long Text</option>
                  <option value="numeric">Numeric</option>
                  <option value="single_choice">Single Choice</option>
                  <option value="multi_choice">Multi Choice</option>
                  <option value="file_upload">File Upload</option>
                </select>
                <button onClick={() => removeQuestion(section.id, q.id)}>Delete</button>

                {q.type.includes("choice") && (
                  <div>
                    {q.options.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[idx] = e.target.value;
                          updateQuestion(section.id, q.id, { options: newOptions });
                        }}
                      />
                    ))}
                    <button onClick={() => updateQuestion(section.id, q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}>
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => addQuestion(section.id)}>Add Question</button>
          </div>
        </div>
      ))}

      <h2>Live Preview</h2>
      {assessment.sections.map((section) => (
        <div key={section.id} style={{ padding: "0.5rem", border: "1px dashed #007bff", marginBottom: "1rem" }}>
          <h3>{section.title}</h3>
          {section.questions.map(q => (
            <div key={q.id}>
              <label>{q.text} {q.required && "*"}</label><br/>
              {q.type === "short_text" && <input type="text" maxLength={q.validation?.maxLength} required={q.required} />}
              {q.type === "long_text" && <textarea maxLength={q.validation?.maxLength} required={q.required} />}
              {q.type === "numeric" && <input type="number" min={q.validation?.min} max={q.validation?.max} required={q.required} />}
              {q.type === "single_choice" && q.options.map((opt, idx) => (
                <label key={idx}><input type="radio" name={q.id} /> {opt}</label>
              ))}
              {q.type === "multi_choice" && q.options.map((opt, idx) => (
                <label key={idx}><input type="checkbox" name={q.id} /> {opt}</label>
              ))}
              {q.type === "file_upload" && <input type="file" />}
            </div>
          ))}
        </div>
      ))}

      <button onClick={handleSave} style={{ marginTop: "1rem" }}>Save Assessment</button>
    </div>
  );
}
