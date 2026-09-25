export interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  date: string;
  duration: string;
  spotsAvailable: number;
  remote: boolean;
  description?: string;
  skillsRequired?: string[];
  contactEmail?: string;
}
