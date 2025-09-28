import { db } from "./db";
import { slugify } from "../utilis/slugify";

// Jobs API
export async function getJobs({ search = "", status, page = 1, pageSize = 10 }) {
  let query = db.jobs.orderBy("order");

  if (status) {
    query = query.filter((job) => job.status === status);
  }

  let jobs = await query.toArray();

  if (search) {
    const s = search.toLowerCase();
    jobs = jobs.filter((job) => job.title.toLowerCase().includes(s));
  }

  const total = jobs.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return { data: jobs.slice(start, end), total };
}

export async function createJob({ title, tags = [] }) {
  const slug = slugify(title);
  const exists = await db.jobs.where("slug").equals(slug).first();
  if (exists) throw new Error("Slug already exists");

  const order = (await db.jobs.count()) + 1;
  const job = { title, slug, status: "active", tags, order };
  const id = await db.jobs.add(job);
  return { id, ...job };
}

export async function updateJob(id, updates) {
  await db.jobs.update(id, updates);
  return await db.jobs.get(id);
}

export async function archiveJob(id, archived = true) {
  await db.jobs.update(id, { status: archived ? "archived" : "active" });
  return await db.jobs.get(id);
}

export async function reorderJob({ fromOrder, toOrder }) {
  const jobs = await db.jobs.orderBy("order").toArray();
  const moved = jobs.find((j) => j.order === fromOrder);
  if (!moved) throw new Error("Job not found");

  jobs.splice(fromOrder, 1);
  jobs.splice(toOrder, 0, moved);

  for (let i = 0; i < jobs.length; i++) {
    await db.jobs.update(jobs[i].id, { order: i });
  }

  return moved;
}

// Candidates API
export async function getCandidates({ search = "", stage, page = 1, pageSize = 50 }) {
  let query = db.candidates.orderBy("id");

  if (stage) {
    query = query.filter((c) => c.stage === stage);
  }

  let candidates = await query.toArray();

  if (search) {
    const s = search.toLowerCase();
    candidates = candidates.filter(
      (c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)
    );
  }

  const total = candidates.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return { data: candidates.slice(start, end), total };
}

export async function updateCandidateStage(id, stage) {
  await db.candidates.update(id, { stage });
  return await db.candidates.get(id);
}

export async function getCandidateTimeline(id) {
  return await db.timelines.where("candidateId").equals(id).toArray();
}

// Notes API
export async function addNote(candidateId, text) {
  const note = { candidateId, text, timestamp: Date.now() };
  const id = await db.notes.add(note);
  return { id, ...note };
}

export async function getNotes(candidateId) {
  return await db.notes.where("candidateId").equals(candidateId).toArray();
}

// Assessments API
export async function getAssessment(jobId) {
  return await db.assessments.get(jobId);
}

export async function saveAssessment(jobId, sections) {
  await db.assessments.put({ jobId, sections });
  return { jobId, sections };
}




export async function submitAssessment(jobId, candidateId, responses) {
  
  const entry = { candidateId, jobId, responses, timestamp: Date.now() };
  const id = await db.responses.add(entry);
  return { id, ...entry };
}

// Optional: fetch candidate responses later
export async function getCandidateResponses(candidateId, jobId) {
  return await db.responses
    .where({ candidateId, jobId })
    .toArray();
}