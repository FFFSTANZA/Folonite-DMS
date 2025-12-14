export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type FaultType =
  | 'Overcurrent'
  | 'Overvoltage'
  | 'Low grid voltage'
  | 'Overheating'
  | 'BMS communication mismatch'
  | 'OCPP network disconnect'
  | 'Power module failure'
  | 'Vehicle-side abort'
  | 'Emergency stop'
  | 'Contactor stuck'
  | 'Repeated soft restarts';

export interface LogEntry {
  errorCode?: string;
  timestamp?: string;
  connectorId?: string;
  chargerId?: string;
  meterValue?: number;
  temperature?: number;
  voltage?: number;
  current?: number;
  ocppStatus?: string;
  transactionStopReason?: string;
  vendorError?: string;
  rawData?: string;
}

export interface FaultAnalysis {
  id: string;
  faultType: FaultType;
  timestamp: string;
  connectorId: string;
  description: string;
  rootCause: string;
  impact: string;
  severity: SeverityLevel;
  resolution: string;
  downtime: number;
  logEntry: LogEntry;
}

export interface CostParameters {
  avgSessionValue: number;
  avgSessionsPerDay: number;
}

export interface CostAnalysis {
  revenueToday: number;
  revenueThisMonth: number;
  topCostliestFaults: Array<{
    faultType: FaultType;
    totalCost: number;
    occurrences: number;
  }>;
}

export interface DashboardData {
  faults: FaultAnalysis[];
  costAnalysis: CostAnalysis;
  totalFaults: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
}
