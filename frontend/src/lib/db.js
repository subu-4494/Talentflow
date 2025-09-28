import Dexie from "dexie";

export const db = new Dexie("talentflow_db");

db.version(1).stores({
  jobs: "++id, title, slug, status, tags, order",
  candidates: "++id, name, email, jobId, stage",
  assessments: "jobId, sections",
  timelines: "++id, candidateId, timestamp, status",
  notes: "++id, candidateId, text, timestamp",
  responses: "++id, candidateId, jobId",
});
