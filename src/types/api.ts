export interface User {
  jobSeekerId?: string; // Canonical jobseeker id for this user
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  roleId: string;
  role: Role;
  organizationId: string;
  organization: Organization;
  emailVerified?: boolean;
  disabled: boolean;
  createdDateTime?: string;
  lastLogin?: string;
  lastUpdatedDateTime?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  roleName: string;
  roleDescription?: string;
  rolePermission?: string;
}

export interface Organization {
  id: string;
  name?: string;
  description: string;
  domain: string;
  disabled: boolean;
  logo_img_src?: string;
}

export interface JobSeeker {
  id: string;
  user: User;
  firstName?: string;
  lastName?: string;
  location?: string;
  phone?: string;
  desiredSalary?: string;
  preferredJobTypes?: string;
}

export interface JobSeekerSkill {
  id: string;
  jobSeekerId: string;
  skillName: string;
}

export interface JobSeekerExperience {
  id: string;
  jobSeekerId: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: any;
}

export interface JobSeekerEducation {
  id: string;
  jobSeekerId: string;
  degree?: string;
  university?: string;
  graduationYear?: number;
}

export interface JobSeekerCertification {
  id: string;
  jobSeekerId: string;
  certificationName: string;
  certificationFile?: string;
  issuedDate?: string;
  expiryDate?: string;
  issuingOrganization?: string;
}

export interface JobResume {
  id: string;
  googleJobId: string;
  resumeFile: string;
  resumeText?: string;
  matchPercentage?: number;
  uploadedAt?: string;
}

export interface GoogleJob {
  id: string;
  jobId: string;
  title: string;
  companyName: string;
  location?: string;
  via?: string;
  shareLink?: string;
  postedAt?: string;
  salary?: string;
  scheduleType?: string;
  qualifications?: string;
  description?: string;
  responsibilities?: any;
  benefits?: any;
  applyLinks?: string;
  jobTitle?: string;
  city?: City;
  extractedSkills?: string[];
  extractedExperience?: string[];
  extractedRemote?: string[];
  createdDateTime?: string;
}

export interface JobTitle {
  id: number;
  title: string;
}

export interface City {
  id: number;
  name: string;
  state?: string;
  country?: string;
  population?: number;
  growth?: number;
}

export const ROLES = {
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  EMPLOYER: 'ROLE_EMPLOYER',
  JOBSEEKER: 'ROLE_JOBSEEKER'
} as const;
