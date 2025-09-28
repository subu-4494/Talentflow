import { http, HttpResponse } from 'msw';
import * as api from '../api';

const LATENCY = () => Math.floor(Math.random() * 1000) + 200;
const ERROR_RATE = 0.1;

function maybeFail() {
  if (Math.random() < ERROR_RATE) {
    const error = new Error('Simulated server error');
    error.status = 500;
    throw error;
  }
}

// Helper to apply common response options (like latency)
const withDelay = (response, status = 200) => {
    // MSW v2 uses the x-msw-delay header to simulate latency
    return HttpResponse.json(response, { 
        status: status, 
        headers: { 'x-msw-delay': LATENCY().toString() } 
    });
};

export const handlers = [
  // -------------------- Jobs --------------------
  http.get('/jobs', async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const data = await api.getJobs({ search, status, page, pageSize });
    return withDelay(data, 200);
  }),

  http.post('/jobs', async ({ request }) => {
    try {
      maybeFail();
      const body = await request.json();
      const job = await api.createJob(body);
      return withDelay(job, 201);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  http.patch('/jobs/:id', async ({ request, params }) => {
    try {
      maybeFail();
      const id = Number(params.id);
      const body = await request.json();
      const job = await api.updateJob(id, body);
      return withDelay(job, 200);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  http.patch('/jobs/:id/reorder', async ({ request }) => {
    try {
      maybeFail();
      const body = await request.json(); // { fromOrder, toOrder }
      const job = await api.reorderJob(body);
      return withDelay(job, 200);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  // -------------------- Candidates --------------------
  http.get('/candidates', async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage');
    const page = parseInt(url.searchParams.get('page') || '1');

    const data = await api.getCandidates({ search, stage, page });
    return withDelay(data, 200);
  }),

  http.patch('/candidates/:id', async ({ request, params }) => {
    try {
      maybeFail();
      const id = Number(params.id);
      const body = await request.json();
      const candidate = await api.updateCandidateStage(id, body.stage);
      return withDelay(candidate, 200);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  http.get('/candidates/:id/timeline', async ({ params }) => {
    const id = Number(params.id);
    const timeline = await api.getCandidateTimeline(id);
    return withDelay(timeline, 200);
  }),

  // -------------------- Notes --------------------
  http.get('/notes/:candidateId', async ({ params }) => {
    const candidateId = Number(params.candidateId);
    const notes = await api.getNotes(candidateId);
    return withDelay(notes, 200);
  }),

  http.post('/notes/:candidateId', async ({ request, params }) => {
    try {
      maybeFail();
      const candidateId = Number(params.candidateId);
      const body = await request.json();
      const note = await api.addNote(candidateId, body.text);
      return withDelay(note, 201);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  // -------------------- Assessments --------------------
  http.get('/assessments/:jobId', async ({ params }) => {
    const jobId = Number(params.jobId);
    const assessment = await api.getAssessment(jobId);
    return withDelay(assessment, 200);
  }),

  http.put('/assessments/:jobId', async ({ request, params }) => {
    try {
      maybeFail();
      const jobId = Number(params.jobId);
      const body = await request.json();
      const result = await api.saveAssessment(jobId, body.sections);
      return withDelay(result, 200);
    } catch (err) {
      return withDelay({ error: err.message }, 500);
    }
  }),

  http.post('/assessments/:jobId/submit', async ({ request, params }) => {
    const jobId = Number(params.jobId);
    const body = await request.json(); // { candidateId, responses }
    const result = await api.submitAssessment(jobId, body.candidateId, body.responses);
    return withDelay(result, 200);
  }),
];