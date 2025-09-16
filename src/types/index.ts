export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract';
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: CandidateStage;
  jobId: string;
  referred: boolean;
  referredBy?: string;
  phone?: string;
  resume?: string;
  notes: CandidateNote[];
  createdAt: Date;
  updatedAt: Date;
}

export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';

export interface CandidateNote {
  id: string;
  content: string;
  mentions: string[];
  author: string;
  createdAt: Date;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'applied';
  previousStage?: CandidateStage;
  newStage?: CandidateStage;
  note?: string;
  author: string;
  createdAt: Date;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[];
  validation?: {
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
  conditionalLogic?: {
    dependsOn: string;
    showIf: string | string[];
  };
  order: number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface Theme {
  mode: 'light' | 'dark';
}