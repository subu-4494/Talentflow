import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCandidates,
  getCandidateTimeline,
  getNotes,
  addNote,
  getAssessment,
  getCandidateResponses,
} from "../lib/api";

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await getCandidates({ page: 1, pageSize: 1000 });
        const c = cRes.data.find((cand) => cand.id === Number(id));
        setCandidate(c);

        if (c) {
          const t = await getCandidateTimeline(Number(id));
          setTimeline(t);

          const n = await getNotes(Number(id));
          setNotes(n);

          const assmts = [];
          if (c.jobId) {
            const assessment = await getAssessment(Number(c.jobId));
            if (assessment) {
              const resps = await getCandidateResponses(
                Number(id),
                Number(c.jobId)
              );
              // Take latest response
              const latestResponse =
                resps.length > 0 ? resps[resps.length - 1] : null;
              assmts.push({ jobId: c.jobId, assessment, latestResponse });
            }
          }
          setAssessments(assmts);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const newNote = await addNote(Number(id), noteText);
      setNotes((prev) => [...prev, newNote]);
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  if (loading)
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading candidate...</div>;
  if (!candidate)
    return <div style={{ padding: "2rem", textAlign: "center" }}>Candidate not found</div>;

  const styles = {
    container: { maxWidth: 900, margin: "2rem auto", padding: "0 1rem" },
    section: { marginBottom: "2rem" },
    input: { padding: "0.5rem 0.8rem", borderRadius: 6, border: "1px solid #ccc", width: "70%", maxWidth: 400 },
    button: { padding: "0.5rem 1rem", marginLeft: "0.5rem", borderRadius: 6, border: "none", backgroundColor: "#2563eb", color: "#fff", fontWeight: 500, cursor: "pointer" },
    card: { padding: "1rem", marginBottom: "1rem", border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
    timelineItem: { padding: "0.5rem 0", borderBottom: "1px solid #eee" },
    noteItem: { padding: "0.5rem 0", borderBottom: "1px solid #ddd" },
    assessmentCard: { padding: "1rem", marginBottom: "1rem", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9f9f9" },
    responseCard: { padding: "0.5rem", marginBottom: "0.5rem", border: "1px solid #ddd", borderRadius: 6, background: "#fff" },
    pageTitle: { marginBottom: "1rem", fontSize: "2rem", fontWeight: 600 },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>{candidate.name}</h1>
      <p><strong>Email:</strong> {candidate.email}</p>
      <p><strong>Stage:</strong> {candidate.stage}</p>

      <div style={styles.section}>
        <h2>Timeline</h2>
        <ul style={{ paddingLeft: "1rem" }}>
          {timeline.map((t) => (
            <li key={t.id} style={styles.timelineItem}>
              {new Date(t.timestamp).toLocaleString()}: {t.status}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2>Notes</h2>
        {notes.map((n) => (
          <div key={n.id} style={styles.noteItem}>
            {n.text} <small>({new Date(n.timestamp).toLocaleString()})</small>
          </div>
        ))}
        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add note..."
            style={styles.input}
          />
          <button style={styles.button} onClick={handleAddNote}>Add</button>
        </div>
      </div>

      <div style={styles.section}>
        <h2>Assessments</h2>
        {assessments.length === 0 ? (
          <p>No assessments found for this candidate.</p>
        ) : (
          assessments.map((a) => (
            <div key={a.jobId} style={styles.assessmentCard}>
              <h3>Job ID: {a.jobId}</h3>
              <Link to={`/assessments/${a.jobId}/form/${candidate.id}`}>
                <button style={styles.button}>Take / View Assessment</button>
              </Link>

              {a.latestResponse ? (
                <div style={{ marginTop: "1rem" }}>
                  <h4>Latest Submitted Response:</h4>
                  <div style={styles.responseCard}>
                    <p><strong>Submitted at:</strong> {new Date(a.latestResponse.timestamp).toLocaleString()}</p>
                    <ul style={{ paddingLeft: "1rem" }}>
                      {Object.entries(a.latestResponse.responses).map(([qId, ans]) => (
                        <li key={qId}>
                          QID {qId}: {Array.isArray(ans) ? ans.join(", ") : ans?.name || ans || "Not answered"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>No responses submitted yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
