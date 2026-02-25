export type ScanScope = "local" | "national";
export type Audience = "consumers" | "businesses" | "niche";
export type ScanStatus = "queued" | "running" | "complete" | "failed";
export type Confidence = "High" | "Medium" | "Low";

export interface ScanRequest {
  domain: string;
  scope: ScanScope;
  city?: string;
  audience: Audience;
  session_id: string;
}

export interface PageData {
  url: string;
  title: string;
  h1: string;
  h2: string[];
  jsonld: string[];
  word_count: number;
  question_h2_count: number;
  service_keywords: string[];
  raw_text: string;
}

export interface SiteSummary {
  h1_count: number;
  faq_detected: boolean;
  schema_detected: boolean;
  total_word_count: number;
  city_mentions: string[];
  has_local_signals: boolean;
}

export interface StructuralAnalysis {
  pages: PageData[];
  site_summary: SiteSummary;
}

export interface Persona {
  title: string;
  goal: string;
  pain_points: string[];
}

export interface CategoryInfo {
  category: string;
  short_description: string;
  persona: Persona;
}

export interface Query {
  id: string;
  text: string;
  template_used: string;
  tokens: Record<string, string>;
  supported: boolean;
  best_page: string | null;
  scores: { title: number; h2: number; faq: number };
}

export interface ScoreBreakdown {
  h1_score: number;
  question_h2_score: number;
  schema_score: number;
  word_count_score: number;
  localized_score: number;
  structure_score: number;
  intent_support_pct: number;
  readiness_score: number;
  status_label: string;
}

export interface ScanResult {
  request_id: string;
  scan_token: string;
  domain: string;
  status: ScanStatus;
  error?: string;
  category: string;
  persona: Persona;
  readiness_score: number;
  status_label: string;
  confidence: Confidence;
  example_query: string;
  queries: Array<{ id: string; text: string; supported: boolean }>;
  structural_gaps: string[];
  score_breakdown?: ScoreBreakdown;
  created_at: string;
}

// In-memory store for MVP (replace with DB in production)
export interface ScanRecord extends ScanResult {
  scope: ScanScope;
  city?: string;
  audience: Audience;
  structural_analysis?: StructuralAnalysis;
}
