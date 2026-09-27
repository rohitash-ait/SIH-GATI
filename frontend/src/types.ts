export type Role = 'APPLICANT' | 'OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  district?: string;
  businessName?: string;
}

export interface Approval {
  id: string;
  name: string;
  department: string;
  category: string;
  why: string;
  processingTime: string;
  sla: string;
  fee: string;
  validity: string;
  prerequisites: string[];
  requiredDocuments: string[];
  dependency: string;
  status: string;
  description: string;
  whoNeedsIt: string;
  eligibility: string;
  renewalFrequency: string;
  processSteps: string[];
  dependencies: string[];
}

export interface ApplicationRecord {
  id: string;
  approval: string;
  department: string;
  submittedDate: string;
  status: string;
  currentStage: string;
  nextAction: string;
  lastUpdated: string;
  priority: string;
  sla: string;
}
