const API_DELAY = () => Math.random() * (1200 - 200) + 200;
const ERROR_RATE = 0.08;
const shouldError = () => Math.random() < ERROR_RATE;

import { setupWorker } from 'msw/browser';
import { http, HttpResponse, delay } from 'msw';
import { db } from './db';
import { Job, Candidate, Assessment, CandidateStage, CandidateTimelineEvent } from '../types';

// ...existing code...

const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay(API_DELAY());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const location = url.searchParams.get('location') || '';
  const tags = url.searchParams.getAll('tag');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let query = db.jobs.orderBy(sort as keyof Job);

    if (status) {
      query = query.filter(job => job.status === status);
    }
    if (type) {
      query = query.filter(job => job.type === type);
    }
    if (location) {
      query = query.filter(job => job.location === location);
    }
    if (tags && tags.length > 0) {
      query = query.filter(job => tags.every(t => job.tags.includes(t)));
    }
    if (search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }

    const jobs = await query.toArray();
    const total = jobs.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(API_DELAY());
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const jobData = await request.json() as Partial<Job>;
    const newJob: Job = {
      id: Date.now().toString(),
      title: jobData.title!,
      slug: jobData.title!.toLowerCase().replace(/\s+/g, '-'),
      status: jobData.status || 'active',
      tags: jobData.tags || [],
      order: jobData.order || 0,
      description: jobData.description,
      requirements: jobData.requirements,
      location: jobData.location,
      type: jobData.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.jobs.add(newJob);
    return HttpResponse.json({ data: newJob });
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay(API_DELAY());
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const id = params.id as string;
    const updates = await request.json() as Partial<Job>;
    
    await db.jobs.update(id, { ...updates, updatedAt: new Date() });
    const updatedJob = await db.jobs.get(id);
    
    return HttpResponse.json({ data: updatedJob });
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay(API_DELAY());
    // Simulate occasional failures for optimistic update rollback testing
    if (Math.random() < 0.1) {
      return new HttpResponse(null, { status: 500 });
    }

    const id = params.id as string;
    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    // Update the job's order
    await db.jobs.update(id, { order: toOrder, updatedAt: new Date() });
    
    return HttpResponse.json({ success: true });
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay(API_DELAY());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let query = db.candidates.orderBy('createdAt').reverse();
    
    if (stage) {
      query = query.filter(candidate => candidate.stage === stage);
    }
    
    if (jobId) {
      query = query.filter(candidate => candidate.jobId === jobId);
    }
    
    if (search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const candidates = await query.toArray();
    const total = candidates.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay(API_DELAY());
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const id = params.id as string;
    const updates = await request.json() as Partial<Candidate & { author?: string }>;

    const candidate = await db.candidates.get(id);
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }

    // If stage is changing, create timeline event
    if (updates.stage && updates.stage !== candidate.stage) {
      // Accept author (HR name) from request body, fallback to 'HR Team'
      const author = updates.author || 'HR Team';
      const timelineEvent: CandidateTimelineEvent = {
        id: Date.now().toString(),
        candidateId: id,
        type: 'stage_change',
        previousStage: candidate.stage,
        newStage: updates.stage,
        author,
        createdAt: new Date()
      };
      await db.timelineEvents.add(timelineEvent);
    }
    
    await db.candidates.update(id, { ...updates, updatedAt: new Date() });
    const updatedCandidate = await db.candidates.get(id);
    
    return HttpResponse.json({ data: updatedCandidate });
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(API_DELAY());
    
    const id = params.id as string;
    const events = await db.timelineEvents
      .where('candidateId')
      .equals(id)
      .reverse()
      .sortBy('createdAt');
    
    return HttpResponse.json({ data: events });
  }),

  // Assessments endpoints
  // Get all assessments (optionally filter by jobId)
  http.get('/api/assessments', async ({ request }) => {
    await delay(API_DELAY());
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    let assessments;
    if (jobId) {
      assessments = await db.assessments.where('jobId').equals(jobId).toArray();
    } else {
      assessments = await db.assessments.toArray();
    }
    return HttpResponse.json({ data: assessments });
  }),

  // Get a single assessment by id
  http.get('/api/assessments/:id', async ({ params }) => {
    await delay(API_DELAY());
    const id = params.id as string;
    const assessment = await db.assessments.get(id);
    return HttpResponse.json({ data: assessment });
  }),

  // Create a new assessment
  http.post('/api/assessments', async ({ request }) => {
    await delay(API_DELAY());
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }
    const assessmentData = await request.json() as Assessment;
    const newAssessment: Assessment = {
      ...assessmentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.assessments.add(newAssessment);
    return HttpResponse.json({ data: newAssessment });
  }),

  // Update an assessment by id

  http.put('/api/assessments/:id', async ({ params, request }) => {
    await delay(API_DELAY());
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }
    const id = params.id as string;
    const assessmentData = await request.json() as Assessment;
    await db.assessments.update(id, {
      ...assessmentData,
      updatedAt: new Date()
    });
    const updatedAssessment = await db.assessments.get(id);
    return HttpResponse.json({ data: updatedAssessment });
  }),

  // Delete an assessment by id
  http.delete('/api/assessments/:id', async ({ params }) => {
    await delay(API_DELAY());
    const id = params.id as string;
    await db.assessments.delete(id);
    return HttpResponse.json({ success: true });
  })

];

export const worker = setupWorker(...handlers);