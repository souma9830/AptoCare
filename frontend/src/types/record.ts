export interface Record {
  client_id?: string; // Optional for components that don't use it
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  filename?: string; // Optional field to store original filename
  // Optional fields for version/history
  version?: number;
  modification_date?: string;
  modified_by?: string;
} 