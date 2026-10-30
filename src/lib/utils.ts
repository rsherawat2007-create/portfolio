import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not set";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "Not set";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(d);
}

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const SKILL_STATUSES = ["planned", "learning", "practiced", "demonstrated"] as const;
export type SkillStatus = typeof SKILL_STATUSES[number];

export const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  planned: "Planned",
  learning: "Learning",
  practiced: "Practiced",
  demonstrated: "Demonstrated",
};

export const SKILL_STATUS_COLORS: Record<SkillStatus, string> = {
  planned: "text-slate-400 bg-slate-800 border-slate-700",
  learning: "text-blue-400 bg-blue-950 border-blue-800",
  practiced: "text-amber-400 bg-amber-950 border-amber-800",
  demonstrated: "text-emerald-400 bg-emerald-950 border-emerald-800",
};

export const PROJECT_STATUSES = ["idea", "planned", "in_development", "testing", "completed", "archived"] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  in_development: "In Development",
  testing: "Testing",
  completed: "Completed",
  archived: "Archived",
};

export const LAB_STATUSES = ["planned", "in_progress", "completed", "reviewed"] as const;
export type LabStatus = typeof LAB_STATUSES[number];

export const SKILL_CATEGORIES = [
  "Programming Languages",
  "Python & Scripting",
  "C / C++",
  "SQL & Databases",
  "Computer Networks",
  "Linux & Operating Systems",
  "Cybersecurity",
  "Ethical Hacking & Penetration Testing",
  "SOC & Defensive Security",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Data Analysis",
  "Web Development",
  "Cloud & DevOps",
  "Software Engineering",
  "Communication & Teamwork",
  "Other",
] as const;

export const LAB_CATEGORIES = [
  "Networking",
  "Linux",
  "Web Security",
  "Authentication",
  "Vulnerability Analysis",
  "Defensive Security",
  "Incident Response",
  "Threat Hunting",
  "Malware Analysis Concepts",
  "Cloud Security",
  "AI Application Security",
  "Other",
] as const;

export const EXPERIMENT_CATEGORIES = [
  "Classification",
  "Regression",
  "Clustering",
  "Anomaly Detection",
  "NLP",
  "Deep Learning",
  "Computer Vision",
  "Reinforcement Learning",
  "Other",
] as const;
