export type RiskLevel = 'medium' | 'high' | 'critical';

export interface PatternDetection {
  patternType: string;
  count: number;
  threshold: number;
  timeWindow: string;
  detected: boolean;
}

export interface PredictiveAlert {
  chargerId: string;
  connectorId?: string;
  riskLevel: RiskLevel;
  healthScore: number;
  patterns: PatternDetection[];
  explanation: string;
  recommendedAction: string;
  estimatedRevenueLoss: number;
  daysUntilFailure: number;
}

export interface ChargerHealth {
  chargerId: string;
  healthScore: number;
  riskLevel: RiskLevel | 'low';
  totalFaults: number;
  criticalPatterns: number;
  lastFaultDate: string;
}

export interface PredictiveSummary {
  totalChargers: number;
  atRiskChargers: number;
  criticalAlerts: number;
  highRiskAlerts: number;
  mediumRiskAlerts: number;
  totalEstimatedLoss: number;
  averageHealthScore: number;
}
