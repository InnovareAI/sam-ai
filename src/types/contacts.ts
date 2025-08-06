export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  notes?: string;
  status: "New Contact" | "In Progress" | "Qualified" | "Lost";
  priority?: "High" | "Medium" | "Low";
  whatsapp?: string;
  company_phone?: string;
  avatar_url?: string;
  tags?: string[];
  score?: number;
  last_contacted?: string;
  created_at: string;
  updated_at: string;
}