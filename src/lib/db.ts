import Dexie, { Table } from 'dexie';
import { Job, Candidate, Assessment, AssessmentResponse, CandidateTimelineEvent } from '../types';
import { CandidateStage } from '../types';

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  timelineEvents!: Table<CandidateTimelineEvent>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt',
      candidates: 'id, name, email, stage, jobId, referred, createdAt',
      assessments: 'id, jobId, createdAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt',
      timelineEvents: 'id, candidateId, type, createdAt'
    });
  }
}

export const db = new TalentFlowDB();

// Initialize with seed data
export const initializeDatabase = async () => {
  await seedDatabase();
};

// Accepts an optional HR name for seeding timeline events
export const seedDatabase = async (hrName?: string) => {
  // Clear tables before seeding
  await db.jobs.clear();
  await db.candidates.clear();
  await db.assessments.clear();
  await db.assessmentResponses.clear();
  await db.timelineEvents.clear();

  // Seed Jobs
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      slug: 'senior-frontend-developer',
      status: 'active',
      tags: ['React', 'TypeScript', 'Frontend'],
      order: 1,
      description: 'Looking for an experienced frontend developer to join our team.',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Modern CSS'],
      location: 'Remote',
      type: 'full-time',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Backend Engineer',
      slug: 'backend-engineer',
      status: 'active',
      tags: ['Node.js', 'Python', 'Backend'],
      order: 2,
      description: 'Building scalable backend systems.',
      requirements: ['Node.js or Python', 'Database design', 'API development'],
      location: 'San Francisco',
      type: 'full-time',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    // ... more jobs
  ];

  // Generate 25 jobs
  for (let i = 3; i <= 25; i++) {
    const titles = [
      'Product Manager', 'UX Designer', 'DevOps Engineer', 'Data Scientist',
      'Mobile Developer', 'QA Engineer', 'Security Analyst', 'Marketing Manager',
      'Sales Representative', 'Customer Success', 'Technical Writer', 'HR Specialist'
    ];
    const tags = [
      ['Product', 'Strategy'], ['Design', 'UX/UI'], ['DevOps', 'Cloud'],
      ['Python', 'ML'], ['React Native', 'iOS'], ['Testing', 'Automation'],
      ['Security', 'Compliance'], ['Marketing', 'Growth'], ['Sales', 'B2B'],
      ['Support', 'Customer'], ['Documentation', 'Technical'], ['HR', 'Recruitment']
    ];
    
    jobs.push({
      id: i.toString(),
      title: titles[(i - 3) % titles.length],
      slug: titles[(i - 3) % titles.length].toLowerCase().replace(/\s+/g, '-'),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: tags[(i - 3) % tags.length],
      order: i,
      description: `Exciting opportunity for a ${titles[(i - 3) % titles.length]}`,
      location: ['Remote', 'San Francisco', 'New York', 'London'][Math.floor(Math.random() * 4)],
      type: ['full-time', 'part-time', 'contract'][Math.floor(Math.random() * 3)] as any,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  }

  await db.jobs.bulkAdd(jobs);

  // Seed Candidates
  const candidates: Candidate[] = [];
  const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Anna'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor', 'Anderson', 'Thomas', 'Moore'];

  for (let i = 1; i <= 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const isReferred = Math.random() < 0.2; // 20% are referred
    
    candidates.push({
      id: i.toString(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      jobId: (Math.floor(Math.random() * 25) + 1).toString(),
      referred: isReferred,
      referredBy: isReferred ? 'Current Employee' : undefined,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      notes: [],
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  }

  await db.candidates.bulkAdd(candidates);

  const assessments: Assessment[] = [
    {
      id: '1',
      jobId: '1',
      title: 'Frontend Developer Assessment',
      description: 'Technical assessment for frontend developer position',
      sections: [
        {
          id: '1',
          title: 'Technical Knowledge',
          order: 1,
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: (i + 1).toString(),
            type: i % 3 === 0 ? 'single-choice' : i % 3 === 1 ? 'multi-choice' : 'short-text',
            question: `Frontend Q${i + 1}: Example question?`,
            required: i % 2 === 0,
            options: i % 3 !== 2 ? ['A', 'B', 'C', 'D'] : undefined,
            validation: i % 3 === 2 ? { maxLength: 200 } : undefined,
            order: i + 1
          }))
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      jobId: '2',
      title: 'Backend Engineer Assessment',
      description: 'Assessment for backend engineering skills',
      sections: [
        {
          id: '1',
          title: 'Backend Knowledge',
          order: 1,
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: (i + 1).toString(),
            type: i % 3 === 0 ? 'single-choice' : i % 3 === 1 ? 'multi-choice' : 'short-text',
            question: `Backend Q${i + 1}: Example question?`,
            required: i % 2 === 0,
            options: i % 3 !== 2 ? ['A', 'B', 'C', 'D'] : undefined,
            validation: i % 3 === 2 ? { maxLength: 200 } : undefined,
            order: i + 1
          }))
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      jobId: '3',
      title: 'Product Manager Assessment',
      description: 'Assessment for product management skills',
      sections: [
        {
          id: '1',
          title: 'Product Knowledge',
          order: 1,
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: (i + 1).toString(),
            type: i % 3 === 0 ? 'single-choice' : i % 3 === 1 ? 'multi-choice' : 'short-text',
            question: `Product Q${i + 1}: Example question?`,
            required: i % 2 === 0,
            options: i % 3 !== 2 ? ['A', 'B', 'C', 'D'] : undefined,
            validation: i % 3 === 2 ? { maxLength: 200 } : undefined,
            order: i + 1
          }))
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.assessments.bulkAdd(assessments);
  // Do not seed any timeline events. Only real user actions will create them.
};