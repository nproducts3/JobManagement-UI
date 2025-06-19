
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture?: string;
  role_id: string;
  organization_id: string;
  email_verified?: boolean;
  disabled: boolean;
  created_at?: string;
  last_login?: string;
}

export interface Role {
  id: string;
  role_name: string;
  role_description?: string;
  role_permission?: string;
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
  user_id: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  phone?: string;
  desired_salary?: string;
  preferred_job_types?: string;
}

export interface JobSeekerSkill {
  id: string;
  job_seeker_id: string;
  skill_name: string;
}

export interface JobSeekerExperience {
  id: string;
  job_seeker_id: string;
  job_title?: string;
  company_name?: string;
  start_date?: string;
  end_date?: string;
  responsibilities?: any;
}

export interface JobSeekerEducation {
  id: string;
  job_seeker_id: string;
  degree?: string;
  university?: string;
  graduation_year?: number;
}

export interface JobSeekerCertification {
  id: string;
  job_seeker_id: string;
  certification_name?: string;
}

export interface JobResume {
  id: string;
  googlejob_id: string;
  resume_file: string;
  resume_text?: string;
  match_percentage?: number;
  uploaded_at?: string;
}

export interface GoogleJob {
  id: string;
  job_id: string;
  title: string;
  company_name: string;
  location?: string;
  via?: string;
  share_link?: string;
  posted_at?: string;
  salary?: string;
  schedule_type?: string;
  qualifications?: string;
  description?: string;
  responsibilities?: any;
  benefits?: any;
  apply_links?: string;
  job_title_id?: number;
  city_id?: number;
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
