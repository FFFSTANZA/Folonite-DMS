import type { FaultAnalysis } from '@/types/fault';

export interface SimulationScenario {
  id: string;
  name: string;
  faultFrequencyMultiplier: number; // 0.5 = 50% fewer faults, 2.0 = double faults
  severityEscalationRate: number;   // 0 = no escalation, 1 = full escalation
  maintenanceIntervalDays: number;  // days between maintenance visits
  temperatureDegradation: number;   // extra faults per 10°C above 60°C
  gridStabilityFactor: number;      // 0.5 = very unstable, 1.0 = perfectly stable
  networkReliability: number;       // 0.5 = unreliable, 1.0 = always connected
}

export interface ProjectionPoint {
  day: number;
  healthScore: number;
  faultCount: number;
  revenueLoss: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  projectedDate: string;
}

export interface SimulationResult {
  scenario: SimulationScenario;
  chargerId: string;
  currentHealthScore: number;
  currentFaultCount: number;
  projections: ProjectionPoint[];
  daysUntilCritical: number | null;
  daysUntilFailure: number | null;
  totalProjectedLoss: number;
  breakEvenMaintenanceCost: number;
  recommendation: string;
}

// Default scenarios for quick selection
export const DEFAULT_SCENARIOS: SimulationScenario[] = [
  {
    id: 'current',
    name: 'Current Trend',
    faultFrequencyMultiplier: 1.0,
    severityEscalationRate: 0.5,
    maintenanceIntervalDays: 30,
    temperatureDegradation: 0,
    gridStabilityFactor: 1.0,
    networkReliability: 1.0,
  },
  {
    id: 'optimistic',
    name: 'Optimistic (Regular Maintenance)',
    faultFrequencyMultiplier: 0.4,
    severityEscalationRate: 0.1,
    maintenanceIntervalDays: 14,
    temperatureDegradation: 0,
    gridStabilityFactor: 1.0,
    networkReliability: 1.0,
  },
  {
    id: 'worst-case',
    name: 'Worst Case (No Maintenance)',
    faultFrequencyMultiplier: 1.8,
    severityEscalationRate: 0.9,
    maintenanceIntervalDays: 90,
    temperatureDegradation: 0.5,
    gridStabilityFactor: 0.7,
    networkReliability: 0.7,
  },
  {
    id: 'summer',
    name: 'Summer Heat Stress',
    faultFrequencyMultiplier: 1.3,
    severityEscalationRate: 0.6,
    maintenanceIntervalDays: 30,
    temperatureDegradation: 1.2,
    gridStabilityFactor: 0.85,
    networkReliability: 1.0,
  },
  {
    id: 'grid-unstable',
    name: 'Grid Instability Period',
    faultFrequencyMultiplier: 1.5,
    severityEscalationRate: 0.7,
    maintenanceIntervalDays: 30,
    temperatureDegradation: 0.3,
    gridStabilityFactor: 0.5,
    networkReliability: 0.8,
  },
];

// Fault severity deduction weights
const SEVERITY_DEDUCTION: Record<string, number> = {
  Critical: 20,
  High: 15,
  Medium: 8,
  Low: 3,
};

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 70) return 'Low';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'High';
  return 'Critical';
}

function estimateFaultsForDay(
  baseFaults: FaultAnalysis[],
  day: number,
  scenario: SimulationScenario,
): { count: number; avgSeverity: number } {
  if (baseFaults.length === 0) return { count: 0, avgSeverity: 0 };

  // Average faults per day in historical data
  const timestamps = baseFaults.map((f) => new Date(f.timestamp).getTime());
  const dataSpanDays = Math.max(
    1,
    (Math.max(...timestamps) - Math.min(...timestamps)) / (24 * 60 * 60 * 1000),
  );
  const baseDailyFaults = baseFaults.length / dataSpanDays;

  // Apply scenario modifiers
  let projectedFaults = baseDailyFaults * scenario.faultFrequencyMultiplier;

  // Temperature effect: more faults on hot days (cumulative over time)
  const heatEffect = Math.min(1.0, (scenario.temperatureDegradation * day) / 100);
  projectedFaults *= 1 + heatEffect;

  // Grid stability effect
  projectedFaults *= 2 - scenario.gridStabilityFactor; // 0.5 factor → 1.5x faults

  // Network reliability effect
  projectedFaults *= 2 - scenario.networkReliability;

  // Maintenance effect: faults decrease after maintenance visits
  const daysSinceLastMaintenance = day % scenario.maintenanceIntervalDays;
  if (daysSinceLastMaintenance === 0 && day > 0) {
    projectedFaults *= 0.3; // 70% reduction right after maintenance
  } else if (daysSinceLastMaintenance < 3) {
    projectedFaults *= 0.5; // 50% reduction in first 3 days after maintenance
  }

  // Severity escalation over time
  const severityLevelMap: Record<string, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };
  const baseAvgSeverity =
    baseFaults.reduce((sum, f) => sum + (severityLevelMap[f.severity] || 1), 0) /
    baseFaults.length;
  const escalatedSeverity = Math.min(
    4,
    baseAvgSeverity + scenario.severityEscalationRate * (day / 30) * 0.5,
  );

  return {
    count: Math.max(0, Math.round(projectedFaults * 100) / 100),
    avgSeverity: escalatedSeverity,
  };
}

function severityToName(level: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (level >= 3.5) return 'Critical';
  if (level >= 2.5) return 'High';
  if (level >= 1.5) return 'Medium';
  return 'Low';
}

export function runSimulation(
  faults: FaultAnalysis[],
  chargerId: string,
  scenario: SimulationScenario,
  projectionDays: number = 90,
): SimulationResult | null {
  const chargerFaults = faults.filter(
    (f) => (f.logEntry.chargerId || f.connectorId) === chargerId,
  );

  if (chargerFaults.length === 0) return null;

  // Calculate current health score using the same logic as healthCalculator
  let currentHealthScore = 100;
  const now = Date.now();
  chargerFaults.forEach((fault) => {
    const faultAge = now - new Date(fault.timestamp).getTime();
    const daysSinceFault = faultAge / (24 * 60 * 60 * 1000);
    const recencyWeight = Math.exp(-daysSinceFault / 30);
    const deduction = SEVERITY_DEDUCTION[fault.severity] || 3;
    currentHealthScore -= deduction * recencyWeight;
  });
  currentHealthScore = Math.max(0, Math.min(100, Math.round(currentHealthScore)));

  const projections: ProjectionPoint[] = [];
  let healthScore = currentHealthScore;
  let totalProjectedLoss = 0;
  let cumulativeFaults = 0;
  let daysUntilCritical: number | null = null;
  let daysUntilFailure: number | null = null;

  for (let day = 1; day <= projectionDays; day++) {
    const { count, avgSeverity } = estimateFaultsForDay(chargerFaults, day, scenario);
    cumulativeFaults += count;

    // Deduct health based on projected faults and severity
    const faultImpact = count * (SEVERITY_DEDUCTION[severityToName(avgSeverity)] || 3) * 0.1;
    healthScore = Math.max(0, healthScore - faultImpact);

    // Maintenance recovery boost
    if (day % scenario.maintenanceIntervalDays === 0) {
      healthScore = Math.min(100, healthScore + 8);
    }

    // Revenue loss: ₹120 per fault hour × avg downtime × faults
    const avgDowntime = avgSeverity >= 3 ? 4 : avgSeverity >= 2 ? 2 : 0.5;
    const dayLoss = count * avgDowntime * 120;
    totalProjectedLoss += dayLoss;

    const riskLevel = getRiskLevel(healthScore);
    const projectedDate = new Date(Date.now() + day * 24 * 60 * 60 * 1000);

    projections.push({
      day,
      healthScore: Math.round(healthScore * 10) / 10,
      faultCount: Math.round(count * 100) / 100,
      revenueLoss: Math.round(dayLoss),
      riskLevel,
      projectedDate: projectedDate.toISOString(),
    });

    if (daysUntilCritical === null && healthScore < 30) {
      daysUntilCritical = day;
    }
    if (daysUntilFailure === null && healthScore <= 0) {
      daysUntilFailure = day;
    }
  }

  // Generate recommendation
  const recommendation = generateRecommendation(
    currentHealthScore,
    daysUntilCritical,
    daysUntilFailure,
    totalProjectedLoss,
    scenario,
  );

  // Estimate break-even maintenance cost
  const breakEvenMaintenanceCost = Math.round(totalProjectedLoss * 0.15); // maintenance saves ~85% of loss

  return {
    scenario,
    chargerId,
    currentHealthScore,
    currentFaultCount: chargerFaults.length,
    projections,
    daysUntilCritical,
    daysUntilFailure,
    totalProjectedLoss: Math.round(totalProjectedLoss),
    breakEvenMaintenanceCost,
    recommendation,
  };
}

function generateRecommendation(
  currentHealth: number,
  daysUntilCritical: number | null,
  daysUntilFailure: number | null,
  totalLoss: number,
  scenario: SimulationScenario,
): string {
  if (currentHealth >= 80) {
    return `This charger is in good health (${currentHealth}/100). Maintain the current maintenance schedule of every ${scenario.maintenanceIntervalDays} days. Projected 90-day loss: ₹${totalLoss.toLocaleString()}.`;
  }

  if (daysUntilFailure !== null && daysUntilFailure <= 30) {
    return `URGENT: Projected total failure in ${daysUntilFailure} days. Immediate intervention required. Consider taking offline and scheduling full hardware inspection. Projected loss without action: ₹${totalLoss.toLocaleString()}.`;
  }

  if (daysUntilCritical !== null && daysUntilCritical <= 30) {
    return `Health will drop to Critical level in ${daysUntilCritical} days at current trajectory. Reduce maintenance interval to ${Math.max(7, Math.floor(scenario.maintenanceIntervalDays / 2))} days and inspect cooling/power systems. Projected loss: ₹${totalLoss.toLocaleString()}.`;
  }

  if (currentHealth < 50) {
    return `Health score is ${currentHealth}/100 and declining. Schedule maintenance within 7 days. Focus on power modules and thermal management. Projected 90-day loss: ₹${totalLoss.toLocaleString()}.`;
  }

  return `Health score is ${currentHealth}/100 with moderate risk. Consider reducing maintenance interval to prevent further degradation. Projected 90-day loss: ₹${totalLoss.toLocaleString()}.`;
}

export function getUniqueChargerIds(faults: FaultAnalysis[]): string[] {
  const ids = new Set<string>();
  faults.forEach((f) => {
    ids.add(f.logEntry.chargerId || f.connectorId || 'Unknown');
  });
  return Array.from(ids).sort();
}
