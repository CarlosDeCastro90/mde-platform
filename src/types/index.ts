export type UserRole = "student" | "teacher" | "engineer";
export type ModelType = "PIM" | "PSM" | "metamodel";
export type MemberRole = "viewer" | "editor" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  project_id: string;
  name: string;
  type: ModelType;
  diagram_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Transformation {
  id: string;
  source_model_id: string;
  target_model_id: string | null;
  generated_code: string | null;
  language: string | null;
  created_at: string;
} 
