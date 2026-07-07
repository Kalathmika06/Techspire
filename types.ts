
export enum Shift {
  Morning = 'Morning',
  Afternoon = 'Afternoon',
  Night = 'Night'
}

export enum DefectCategory {
  None = 'None',
  Scratch = 'Scratch',
  Dent = 'Dent',
  Crack = 'Crack',
  Misalignment = 'Misalignment',
  Contamination = 'Contamination',
  LabelError = 'Label Error',
  SurfaceDefect = 'Surface Defect'
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Operator' | 'Manager';
  avatar?: string;
  theme: 'light' | 'dark';
  language: 'en' | 'hi' | 'te' | 'bn' | 'ta' | 'kn' | 'ml' | 'mr';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface ProductionEntry {
  batch_id: string;
  production_date: string;
  product_code: string;
  shift: Shift;
  operator: string;
  machine_id: string;
  material_batch: string;
  production_quantity: number;
  speed: number;
  temperature: number;
  pressure: number;
  defect_category: DefectCategory;
  rejected_quantity: number;
  defect_count: number;
  rework_required: 'Yes' | 'No';
  comments: string;
  factory_location: string;
  rejection_rate_percent: number;
}
