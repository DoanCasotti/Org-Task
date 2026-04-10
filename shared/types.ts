export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type MemberRole = "owner" | "admin" | "member";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profiles?: Profile;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}