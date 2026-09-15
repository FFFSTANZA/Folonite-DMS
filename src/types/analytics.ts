// Session data from CSV upload
export interface SessionData {
  siteId: string;
  chargerId: string;
  connectorId: string;
  energy_kWh: number;
  sessionDurationMin: number;
  tariffINR: number;
  revenueINR: number;
  startTime: string;
  stopTime: string;
}

// Site-level metrics
export interface SiteMetrics {
  siteId: string;
  totalRevenue: number;
  totalEnergy: number;
  avgSessionRevenue: number;
  avgSessionDuration: number;
  utilizationPercent: number;
  sessionsPerDay: number;
  peakHour: number;
  totalSessions: number;
  chargerCount: number;
  connectorCount: number;
}

// Charger-level metrics
export interface ChargerMetrics {
  siteId: string;
  chargerId: string;
  totalRevenue: number;
  totalEnergy: number;
  totalSessions: number;
  avgSessionRevenue: number;
  avgSessionDuration: number;
  utilizationPercent: number;
  sessionsPerDay: number;
  performance: 'good' | 'low' | 'dead' | 'underutilized';
  connectorCount: number;
}

// Connector-level metrics
export interface ConnectorMetrics {
  siteId: string;
  chargerId: string;
  connectorId: string;
  totalRevenue: number;
  totalEnergy: number;
  totalSessions: number;
  avgSessionRevenue: number;
  utilizationPercent: number;
}

// Recommendation types
export type RecommendationType = 
  | 'increase_tariff'
  | 'relocate_charger'
  | 'add_charger'
  | 'check_grid'
  | 'maintenance_needed'
  | 'optimize_pricing';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  severity: 'high' | 'medium' | 'low';
  siteId: string;
  chargerId?: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

// Analytics summary
export interface AnalyticsSummary {
  totalSites: number;
  totalChargers: number;
  totalRevenue: number;
  totalEnergy: number;
  totalSessions: number;
  avgUtilization: number;
  deadChargers: number;
  underutilizedChargers: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Chart data
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
