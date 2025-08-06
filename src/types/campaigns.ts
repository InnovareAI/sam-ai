export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: "Email" | "LinkedIn" | "Multi-channel" | "Cold Outreach";
  status: "Draft" | "Active" | "Paused" | "Completed";
  start_date?: string;
  end_date?: string;
  channels?: string[];
  stats?: {
    contacts?: number;
    sent?: number;
    opened?: number;
    replied?: number;
    connected?: number;
    responseRate?: number;
  };
  settings?: any;
  created_at: string;
  updated_at: string;
}