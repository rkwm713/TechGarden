import { UserRole } from './types';

export type TaskStatus = 'open' | 'assigned' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type PlantStatus = 'seeded' | 'sprouting' | 'growing' | 'harvesting' | 'finished';
export type PlotType = 'Ground Planted' | 'Raised Bed' | 'Pathway' | 'Sitting Area' | 'Available';
export type PlotAssignmentRole = 'primary' | 'helper';

export interface Achievement {
  title: string;
  description: string;
  achieved: boolean;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface PlotAssignment {
  id: string;
  plot_id: string;
  user_id: string;
  role: PlotAssignmentRole;
  created_at: string;
  user?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  assigned_by?: string;
  assigned_at?: string;
  due_date?: string;
  priority: TaskPriority;
  plot_id?: string;
  plot?: {
    id: string;
    number: string;
  };
  creator?: Profile;
  assignee?: Profile;
  assigner?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  max_participants?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'safety' | 'plots' | 'community';
  order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Plot {
  id: string;
  number: string;
  size: string;
  soil_ph: number;
  sunlight: string;
  soil_type: string;
  irrigation: string;
  plot_type: PlotType;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  assignments?: PlotAssignment[];
}

export interface PlotPlant {
  id: string;
  plot_id: string;
  plant_name: string;
  status: PlantStatus;
  planted_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_GARDEN_TASKS = [
  {
    title: 'Site Cleanup',
    description: 'Remove debris, trash, and unwanted materials from the garden area.',
    priority: 'medium' as TaskPriority
  },
  {
    title: 'Weed Control',
    description: 'Clear existing weeds and overgrown vegetation from garden plots and common areas.',
    priority: 'high' as TaskPriority
  },
  {
    title: 'Soil Testing',
    description: 'Check soil quality including pH levels and nutrient content across garden plots.',
    priority: 'medium' as TaskPriority
  },
  {
    title: 'Soil Amendment',
    description: 'Add compost, fertilizer, or other amendments based on soil test results.',
    priority: 'medium' as TaskPriority
  },
  {
    title: 'Irrigation Inspection',
    description: 'Check for leaks or blockages in the irrigation system and perform necessary repairs.',
    priority: 'high' as TaskPriority
  },
  {
    title: 'Tool Inventory',
    description: 'Conduct an inventory check of all garden tools and equipment.',
    priority: 'low' as TaskPriority
  },
  {
    title: 'Tool Maintenance',
    description: 'Organize, clean, repair, or replace damaged garden tools.',
    priority: 'low' as TaskPriority
  },
  {
    title: 'Infrastructure Inspection',
    description: 'Inspect and repair walkways, borders, and pathways throughout the garden.',
    priority: 'medium' as TaskPriority
  },
  {
    title: 'Pest & Disease Monitoring',
    description: 'Regularly monitor garden plots and plants for signs of pests and diseases.',
    priority: 'high' as TaskPriority
  },
  {
    title: 'Harvest Readiness',
    description: 'Identify and mark produce that is ripe and ready for harvest.',
    priority: 'medium' as TaskPriority
  }
] as const;

export const isAdmin = (role: UserRole) => role === 'admin';
export const isMod = (role: UserRole) => role === 'mod';
export const isRegularUser = (role: UserRole) => role === 'ruser';