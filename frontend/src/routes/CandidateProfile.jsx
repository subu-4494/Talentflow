import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCandidates, getCandidateTimeline, getNotes, addNote, getAssessment, getCandidateResponses } from "../lib/api";

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
      const cRes = await getCandidates({ page: 1, pageSize: 1000 });
      const c = cRes.data.find((cand) => cand.id === Number(id));
      setCandidate(c);

      if (c) {
        const t = await getCandidateTimeline(Number(id));
        setTimeline(t);

        const n = await getNotes(Number(id));
        setNotes(n);

        // Fetch assessments and candidate responses
        const assmts = [];
        if (c.jobId) {
          const assessment = await getAssessment(c.jobId);
          if (assessment) {
            const responses = await getCandidateResponses(Number(id), c.jobId);
            assmts.push({ jobId: c.jobId, assessment, responses });
          }
        }
        setAssessments(assmts);
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const newNote = await addNote(Number(id), noteText);
    setNotes((prev) => [...prev, newNote]);
    setNoteText("");
  };

  if (loading) return <div className="container">Loading candidate...</div>;
  if (!candidate) return <div className="container">Candidate not found</div>;

  return (
    <div className="container">
      <h1 className="page-title">{candidate.name}</h1>
      <p>Email: {candidate.email}</p>
      <p>Stage: {candidate.stage}</p>

      <h2>Timeline</h2>
      <ul>
        {timeline.map((t) => (
          <li key={t.id}>
            {new Date(t.timestamp).toLocaleString()}: {t.status}
          </li>
        ))}
      </ul>

      <h2>Notes</h2>
      <div>
        {notes.map((n) => (
          <div key={n.id} style={{ borderBottom: "1px solid #ddd", padding: "0.5rem 0" }}>
            {n.text} <small>({new Date(n.timestamp).toLocaleString()})</small>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add note..."
          style={{ width: "70%", padding: "0.5rem" }}
        />
        <button onClick={handleAddNote} style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Add
        </button>
      </div>

      <h2>Assessments</h2>
      {assessments.length === 0 ? (
        <p>No assessments found for this candidate.</p>
      ) : (
        assessments.map(a => (
          <div key={a.jobId} className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <h3>Job ID: {a.jobId}</h3>
            <Link to={`/assessments/${a.jobId}/form/${candidate.id}`}>
              <button style={{ marginBottom: "0.5rem" }}>Take / View Assessment</button>
            </Link>

            {a.responses.length > 0 && (
              <div>
                <h4>Submitted Responses:</h4>
                <ul>
                  {a.responses.map((r, idx) => (
                    <li key={idx}>
                      Submitted at: {new Date(r.timestamp).toLocaleString()}
                      <ul>
                        {Object.entries(r.responses).map(([qId, ans]) => (
                          <li key={qId}>
                            QID {qId}: {Array.isArray(ans) ? ans.join(", ") : ans?.name || ans}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
