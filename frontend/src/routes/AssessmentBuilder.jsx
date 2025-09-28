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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading builder...</div>;

  // ===== Styles =====
  const styles = {
    container: { maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "Arial, sans-serif" },
    pageTitle: { fontSize: "2rem", marginBottom: "1rem", color: "#111827" },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: 6,
      border: "none",
      backgroundColor: "#4f46e5",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 500,
      margin: "0.2rem 0.2rem 0.2rem 0",
      transition: "all 0.2s",
    },
    card: {
      padding: "1rem",
      marginBottom: "1rem",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      backgroundColor: "#f9fafb",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    sectionTitle: { fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" },
    questionContainer: {
      padding: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: 6,
      marginBottom: "0.5rem",
      backgroundColor: "#fff",
    },
    input: { width: "70%", padding: "0.4rem 0.6rem", marginRight: "0.5rem", borderRadius: 4, border: "1px solid #ccc" },
    select: { padding: "0.4rem 0.6rem", borderRadius: 4, border: "1px solid #ccc", marginRight: "0.5rem" },
    livePreviewSection: {
      padding: "0.8rem",
      border: "1px dashed #3b82f6",
      marginBottom: "1rem",
      borderRadius: 6,
      backgroundColor: "#f0f9ff",
    },
    label: { display: "block", marginBottom: "0.3rem", fontWeight: 500 },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Assessment Builder for Job {jobId}</h1>
      <button style={styles.button} onClick={addSection}>Add Section</button>

      {assessment.sections.map((section) => (
        <div key={section.id} style={styles.card}>
          <input
            style={{ ...styles.input, fontSize: "1.1rem", fontWeight: "bold" }}
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
          />
          <button style={styles.button} onClick={() => removeSection(section.id)}>Delete Section</button>

          <div style={{ marginTop: "0.5rem" }}>
            {section.questions.map(q => (
              <div key={q.id} style={styles.questionContainer}>
                <input
                  style={styles.input}
                  value={q.text}
                  onChange={(e) => updateQuestion(section.id, q.id, { text: e.target.value })}
                />
                <select
                  style={styles.select}
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
                <button style={styles.button} onClick={() => removeQuestion(section.id, q.id)}>Delete</button>

                {q.type.includes("choice") && (
                  <div style={{ marginTop: "0.3rem" }}>
                    {q.options.map((opt, idx) => (
                      <input
                        key={idx}
                        style={{ ...styles.input, width: "60%", marginBottom: "0.2rem" }}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[idx] = e.target.value;
                          updateQuestion(section.id, q.id, { options: newOptions });
                        }}
                      />
                    ))}
                    <button style={styles.button} onClick={() => updateQuestion(section.id, q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}>
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button style={styles.button} onClick={() => addQuestion(section.id)}>Add Question</button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: "1.5rem" }}>Live Preview</h2>
      {assessment.sections.map((section) => (
        <div key={section.id} style={styles.livePreviewSection}>
          <h3 style={styles.sectionTitle}>{section.title}</h3>
          {section.questions.map(q => (
            <div key={q.id} style={{ marginBottom: "0.5rem" }}>
              <label style={styles.label}>{q.text} {q.required && "*"}</label>
              {q.type === "short_text" && <input type="text" maxLength={q.validation?.maxLength} required={q.required} style={styles.input} />}
              {q.type === "long_text" && <textarea maxLength={q.validation?.maxLength} required={q.required} style={{ ...styles.input, height: "3rem" }} />}
              {q.type === "numeric" && <input type="number" min={q.validation?.min} max={q.validation?.max} required={q.required} style={styles.input} />}
              {q.type === "single_choice" && q.options.map((opt, idx) => (
                <label key={idx} style={{ display: "block" }}>
                  <input type="radio" name={q.id} style={{ marginRight: "0.3rem" }} /> {opt}
                </label>
              ))}
              {q.type === "multi_choice" && q.options.map((opt, idx) => (
                <label key={idx} style={{ display: "block" }}>
                  <input type="checkbox" name={q.id} style={{ marginRight: "0.3rem" }} /> {opt}
                </label>
              ))}
              {q.type === "file_upload" && <input type="file" style={styles.input} />}
            </div>
          ))}
        </div>
      ))}

      <button style={{ ...styles.button, marginTop: "1rem" }} onClick={handleSave}>Save Assessment</button>
    </div>
  );
}
