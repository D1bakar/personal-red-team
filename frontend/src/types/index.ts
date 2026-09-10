export interface User {
  id: string;
  email: string;
  name: string;
  securityScore: number;
  createdAt: string;
}

export interface Simulation {
  id: string;
  userId: string;
  type: SimulationType;
  scenarioName: string;
  psychologicalTriggers: string[];
  status: SimulationStatus;
  content: string;
  deliveredAt: string | null;
  interactedAt: string | null;
  createdAt: string;
}

export type SimulationType =
  | "phishing_email"
  | "smishing"
  | "authority_scam"
  | "urgency_fear"
  | "curiosity_bait"
  | "greed_prize"
  | "secrecy_request"
  | "tech_support"
  | "romance_social";

export type SimulationStatus = "pending" | "active" | "interacted" | "ignored";

export interface ThreatAnalysis {
  id: string;
  inputText: string;
  threatLevel: "safe" | "caution" | "danger";
  threatScore: number;
  triggers: string[];
  explanation: string;
  analyzedAt: string;
}

export interface SecurityScore {
  overall: number;
  simulationSuccessRate: number;
  detectionAccuracy: number;
  learningCompletion: number;
  recency: number;
}

export interface VulnerabilityProfile {
  authority: number;
  urgency: number;
  greed: number;
  curiosity: number;
  secrecy: number;
}

export interface ThreatBriefing {
  id: string;
  title: string;
  summary: string;
  threatType: string;
  severity: "low" | "medium" | "high" | "critical";
  publishedAt: string;
}
