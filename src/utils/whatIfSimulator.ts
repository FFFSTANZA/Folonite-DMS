import type { FaultAnalysis, SeverityLevel } from '@/types/fault';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SimulationScenario {
  id: string;
  name: string;
  faultFrequencyMultiplier: number; // 0.5 = 50% fewer faults, 2.0 = double faults
  severityEscalationRate: number; // 0 = no escalation, 1 = full escalation
  maintenanceIntervalDays: number; // days between maintenance visits
  temperatureDegradation: number; // extra faults per day as heat wear accumulates
  gridStabilityFactor: number; // 0.5 = very unstable, 1.0 = perfectly stable
  networkReliability: number; // 0.5 = unreliable, 1.0 = always connected
}

export interface SimulationEconomics {
  revenuePerHour: number; // ₹ lost per hour of charger downtime
  maintenanceCostPerVisit: number; // ₹ spent per preventive maintenance visit
}

export interface SimulationOptions {
  horizonDays: number;
  economics: SimulationEconomics;
  monteCarloRuns: number;
  seed: number;
}

export interface ProjectionPoint {
  day: number;
  healthScore: number;
  faultCount: number;
  dailyLoss: number;
  cumulativeLoss: number;
  riskLevel: RiskLevel;
  projectedDate: string;
}

export interface MonteCarloPoint {
  day: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloSummary {
  runs: number;
  band: MonteCarloPoint[];
  expectedLoss: number;
  medianLoss: number;
  p95Loss: number;
  bestCaseLoss: number;
  criticalProbability: number; // 0..1 chance health dips below 30 within horizon
  failureProbability: number; // 0..1 chance health hits 0 within horizon
}

export interface SimulationResult {
  scenario: SimulationScenario;
  chargerId: string;
  currentHealthScore: number;
  finalHealthScore: number;
  currentFaultCount: number;
  historicalDailyFaultRate: number;
  projections: ProjectionPoint[];
  daysUntilCritical: number | null;
  daysUntilFailure: number | null;
  totalProjectedFaults: number;
  totalProjectedLoss: number;
  maintenanceVisits: number;
  maintenanceCost: number;
  monteCarlo: MonteCarloSummary | null;
  recommendation: string;
}

export interface ScenarioComparisonRow extends SimulationResult {
  isBaseline: boolean;
  isBest: boolean;
  savingsVsBaseline: number; // loss avoided vs baseline (₹)
  extraMaintenanceVsBaseline: number; // additional maintenance spend vs baseline (₹)
  netBenefitVsBaseline: number; // savings − extra maintenance (₹)
  deltaHealthVsBaseline: number; // final health delta vs baseline (points)
}

export interface ScenarioComparison {
  chargerId: string;
  horizonDays: number;
  economics: SimulationEconomics;
  baselineId: string;
  bestScenarioId: string;
  rows: ScenarioComparisonRow[];
  bestNetBenefit: number;
  recommendation: string;
}

export interface SensitivityItem {
  key: keyof SimulationScenario;
  label: string;
  lowLoss: number;
  highLoss: number;
  swing: number;
  swingPct: number; // swing / baseline loss
  hint: string;
}

export const DEFAULT_ECONOMICS: SimulationEconomics = {
  revenuePerHour: 240,
  maintenanceCostPerVisit: 1500,
};

export const DEFAULT_OPTIONS: SimulationOptions = {
  horizonDays: 90,
  economics: DEFAULT_ECONOMICS,
  monteCarloRuns: 80,
  seed: 20260926,
};

export const HORIZON_CHOICES = [30, 90, 180, 365] as const;

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
  {
    id: 'monsoon',
    name: 'Monsoon / High Humidity',
    faultFrequencyMultiplier: 1.2,
    severityEscalationRate: 0.4,
    maintenanceIntervalDays: 21,
    temperatureDegradation: 0.2,
    gridStabilityFactor: 0.8,
    networkReliability: 0.75,
  },
];

// Slider bounds shared by the UI so sensitivity stays inside valid ranges
export const SCENARIO_BOUNDS: Record<
  keyof Omit<SimulationScenario, 'id' | 'name'>,
  { min: number; max: number; step: number }
> = {
  faultFrequencyMultiplier: { min: 0.1, max: 3.0, step: 0.1 },
  severityEscalationRate: { min: 0, max: 1, step: 0.05 },
  maintenanceIntervalDays: { min: 7, max: 90, step: 1 },
  temperatureDegradation: { min: 0, max: 2, step: 0.1 },
  gridStabilityFactor: { min: 0.3, max: 1.0, step: 0.05 },
  networkReliability: { min: 0.3, max: 1.0, step: 0.05 },
};

const PARAM_LABELS: Record<keyof Omit<SimulationScenario, 'id' | 'name'>, string> = {
  faultFrequencyMultiplier: 'Fault frequency',
  severityEscalationRate: 'Severity escalation',
  maintenanceIntervalDays: 'Maintenance interval',
  temperatureDegradation: 'Heat stress',
  gridStabilityFactor: 'Grid stability',
  networkReliability: 'Network reliability',
};

const PARAM_HINTS: Record<keyof Omit<SimulationScenario, 'id' | 'name'>, string> = {
  faultFrequencyMultiplier: 'Lower fault rate → fewer outages',
  severityEscalationRate: 'Contain severity before it compounds',
  maintenanceIntervalDays: 'Shorter interval → more preventive catches',
  temperatureDegradation: 'Cooling / shading reduces heat wear',
  gridStabilityFactor: 'Stabilisers / DG backup smooth the grid',
  networkReliability: 'Redundant SIM / OCPP link keeps chargers online',
};

// Fault severity deduction weights (same scale as healthCalculator)
const SEVERITY_DEDUCTION: Record<SeverityLevel, number> = {
  Critical: 20,
  High: 15,
  Medium: 8,
  Low: 3,
};

const SEVERITY_LEVEL: Record<SeverityLevel, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const SEVERITIES: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

// Fallback downtime (hours) when history has no samples for a severity
const DEFAULT_DOWNTIME_HOURS: Record<SeverityLevel, number> = {
  Low: 0.5,
  Medium: 2,
  High: 4,
  Critical: 6,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'Low';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'High';
  return 'Critical';
}

/** Deterministic PRNG so Monte Carlo results are reproducible run-to-run. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  // Box-Muller
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = clamp((sorted.length - 1) * p, 0, sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

interface ChargerStats {
  faultCount: number;
  dailyFaultRate: number;
  avgSeverityLevel: number;
  /** Historical pressure the health model treats as “business as usual”. */
  refPressure: number;
  downtimeBySeverity: Record<SeverityLevel, number>;
  healthScore: number;
}

function computeChargerStats(faults: FaultAnalysis[]): ChargerStats | null {
  if (faults.length === 0) return null;

  const times = faults
    .map((f) => new Date(f.timestamp).getTime())
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) return null;

  const spanDays = Math.max(1, (Math.max(...times) - Math.min(...times)) / DAY_MS);

  let severitySum = 0;
  const downtimeAcc: Record<SeverityLevel, { total: number; count: number }> = {
    Low: { total: 0, count: 0 },
    Medium: { total: 0, count: 0 },
    High: { total: 0, count: 0 },
    Critical: { total: 0, count: 0 },
  };

  let health = 100;
  const now = Date.now();

  for (const fault of faults) {
    const severity = fault.severity;
    severitySum += SEVERITY_LEVEL[severity] ?? 1;

    const bucket = downtimeAcc[severity];
    const downtime = Number.isFinite(fault.downtime) && fault.downtime > 0 ? fault.downtime : 0;
    bucket.total += downtime;
    bucket.count += 1;

    const daysSinceFault = (now - new Date(fault.timestamp).getTime()) / DAY_MS;
    health -= (SEVERITY_DEDUCTION[severity] ?? 3) * Math.exp(-daysSinceFault / 30);
  }

  const downtimeBySeverity = {} as Record<SeverityLevel, number>;
  for (const severity of SEVERITIES) {
    const acc = downtimeAcc[severity];
    downtimeBySeverity[severity] =
      acc.count > 0 ? acc.total / acc.count : DEFAULT_DOWNTIME_HOURS[severity];
  }

  const severityWeight = 0.5 + 0.5 * ((severitySum / faults.length) / 4);
  const rate = faults.length / spanDays;

  return {
    faultCount: faults.length,
    dailyFaultRate: rate,
    avgSeverityLevel: severitySum / faults.length,
    refPressure: rate * severityWeight,
    downtimeBySeverity,
    healthScore: clamp(Math.round(health), 0, 100),
  };
}

/**
 * Preventive maintenance effectiveness: more frequent visits prevent more faults.
 * interval 7d ≈ 64% prevented, 30d ≈ 38%, 90d ≈ 10%.
 */
function maintenancePreventionFactor(intervalDays: number): number {
  return clamp(0.75 * Math.exp(-intervalDays / 45), 0.05, 0.7);
}

/** Health restored on each maintenance visit — frequent upkeep recovers more. */
function maintenanceRecoveryAmount(intervalDays: number): number {
  return clamp(2 + 40 / intervalDays, 2, 10);
}

interface DayOutcome {
  faultCount: number;
  severityLevel: number;
}

function severityWeightFor(level: number): number {
  return 0.5 + 0.5 * (clamp(level, 1, 4) / 4);
}

/**
 * Downtime hours for a (possibly fractional) severity level, interpolated
 * between the charger’s historical per-severity averages.
 */
function downtimeForLevel(stats: ChargerStats, level: number): number {
  const lv = clamp(level, 1, 4);
  const lowerIdx = Math.min(SEVERITIES.length - 1, Math.floor(lv) - 1);
  const upperIdx = Math.min(SEVERITIES.length - 1, lowerIdx + 1);
  const frac = lv - (lowerIdx + 1);
  const low = stats.downtimeBySeverity[SEVERITIES[lowerIdx]];
  const high = stats.downtimeBySeverity[SEVERITIES[upperIdx]];
  return low + (high - low) * frac;
}

function projectDay(
  stats: ChargerStats,
  scenario: SimulationScenario,
  day: number,
  rateJitter: number,
): DayOutcome {
  const interval = Math.max(1, Math.round(scenario.maintenanceIntervalDays));

  let rate = stats.dailyFaultRate * scenario.faultFrequencyMultiplier;

  // Environmental multipliers
  rate *= 2 - scenario.gridStabilityFactor;
  rate *= 2 - scenario.networkReliability;
  rate *= 1 + Math.min(1.5, (scenario.temperatureDegradation * day) / 60);

  // Maintenance: regimen assumed running from day 0, visits every `interval` days
  const visitsSoFar = Math.floor(day / interval);
  const lastVisitDay = visitsSoFar * interval; // day 0 = last visit before horizon
  const daysSinceVisit = day - lastVisitDay;
  const prevention = maintenancePreventionFactor(interval);
  const maintenanceFactor = 1 - prevention * Math.exp(-daysSinceVisit / (interval / 2.5));
  rate *= clamp(maintenanceFactor, 0.1, 1.2);

  // Severity escalation over time
  const severityLevel = Math.min(
    4,
    stats.avgSeverityLevel + scenario.severityEscalationRate * (day / 30) * 0.5,
  );

  const faultCount = Math.max(0, rate * rateJitter);
  return { faultCount, severityLevel };
}

function isMaintenanceDay(scenario: SimulationScenario, day: number): boolean {
  const interval = Math.max(1, Math.round(scenario.maintenanceIntervalDays));
  return day > 0 && day % interval === 0;
}

/**
 * Health model: the charger drifts toward a *target* health implied by today’s
 * fault pressure relative to its own history. Worse-than-history pressure pulls
 * health down, better-than-history pressure (e.g. preventive maintenance) lets it
 * recover — so scenarios stay distinguishable instead of all collapsing to 0.
 */
const HEALTH_ADJUST_RATE = 0.03; // ~3% of the gap closed per day (≈3-week response)

function advanceDay(
  stats: ChargerStats,
  scenario: SimulationScenario,
  day: number,
  rateJitter: number,
  severityWobble: number,
  health: number,
  revenuePerHour: number,
): { faultCount: number; health: number; dailyLoss: number } {
  const outcome = projectDay(stats, scenario, day, rateJitter);
  const severityLevel = clamp(outcome.severityLevel + severityWobble, 1, 4);
  const pressure = outcome.faultCount * severityWeightFor(severityLevel);

  const target = clamp(stats.healthScore - (pressure - stats.refPressure) * 40, 0, 100);
  let nextHealth = health + (target - health) * HEALTH_ADJUST_RATE;
  if (isMaintenanceDay(scenario, day)) {
    nextHealth += maintenanceRecoveryAmount(Math.max(1, Math.round(scenario.maintenanceIntervalDays)));
  }
  nextHealth = clamp(nextHealth, 0, 100);

  const dailyLoss = outcome.faultCount * downtimeForLevel(stats, severityLevel) * revenuePerHour;

  return {
    faultCount: outcome.faultCount,
    health: nextHealth,
    dailyLoss,
  };
}

export function runSimulation(
  faults: FaultAnalysis[],
  chargerId: string,
  scenario: SimulationScenario,
  options: Partial<SimulationOptions> = {},
): SimulationResult | null {
  const opts: SimulationOptions = { ...DEFAULT_OPTIONS, ...options };
  const chargerFaults = faults.filter(
    (f) => (f.logEntry.chargerId || f.connectorId) === chargerId,
  );

  const stats = computeChargerStats(chargerFaults);
  if (!stats) return null;

  const { economics, horizonDays } = opts;
  const interval = Math.max(1, Math.round(scenario.maintenanceIntervalDays));

  const projections: ProjectionPoint[] = [];
  let health = stats.healthScore;
  let cumulativeLoss = 0;
  let totalFaults = 0;
  let daysUntilCritical: number | null = null;
  let daysUntilFailure: number | null = null;

  for (let day = 1; day <= horizonDays; day++) {
    const outcome = advanceDay(stats, scenario, day, 1, 0, health, economics.revenuePerHour);
    health = outcome.health;
    totalFaults += outcome.faultCount;
    cumulativeLoss += outcome.dailyLoss;

    const projectedDate = new Date(Date.now() + day * DAY_MS).toISOString();
    projections.push({
      day,
      healthScore: round(health, 1),
      faultCount: round(outcome.faultCount, 2),
      dailyLoss: round(outcome.dailyLoss),
      cumulativeLoss: round(cumulativeLoss),
      riskLevel: getRiskLevel(health),
      projectedDate,
    });

    if (daysUntilCritical === null && health < 30) daysUntilCritical = day;
    if (daysUntilFailure === null && health <= 0) daysUntilFailure = day;
  }

  const maintenanceVisits = Math.floor(horizonDays / interval);
  const maintenanceCost = maintenanceVisits * economics.maintenanceCostPerVisit;

  const monteCarlo =
    opts.monteCarloRuns > 0 ? runMonteCarlo(stats, scenario, opts) : null;

  const result: SimulationResult = {
    scenario,
    chargerId,
    currentHealthScore: stats.healthScore,
    finalHealthScore: projections[projections.length - 1]?.healthScore ?? stats.healthScore,
    currentFaultCount: stats.faultCount,
    historicalDailyFaultRate: round(stats.dailyFaultRate, 3),
    projections,
    daysUntilCritical,
    daysUntilFailure,
    totalProjectedFaults: round(totalFaults, 1),
    totalProjectedLoss: Math.round(cumulativeLoss),
    maintenanceVisits,
    maintenanceCost,
    monteCarlo,
    recommendation: '',
  };

  result.recommendation = generateRecommendation(result);
  return result;
}

function runMonteCarlo(
  stats: ChargerStats,
  scenario: SimulationScenario,
  opts: SimulationOptions,
): MonteCarloSummary {
  const runs = opts.monteCarloRuns;
  const { horizonDays, economics } = opts;

  const healthPaths: number[][] = [];
  const losses: number[] = [];
  let criticalHits = 0;
  let failureHits = 0;

  for (let run = 0; run < runs; run++) {
    const rng = mulberry32(opts.seed + run * 7919);
    // ±22% log-normal rate jitter plus mild severity wobble
    const rateJitterBase = Math.exp(0.22 * gaussian(rng));
    const severityWobble = 0.05 * gaussian(rng);

    let health = stats.healthScore;
    let cumulativeLoss = 0;
    let hitCritical = false;
    let hitFailure = false;
    const path: number[] = [];

    for (let day = 1; day <= horizonDays; day++) {
      const dailyJitter = rateJitterBase * Math.exp(0.08 * gaussian(rng));
      const outcome = advanceDay(
        stats,
        scenario,
        day,
        dailyJitter,
        severityWobble,
        health,
        economics.revenuePerHour,
      );
      health = outcome.health;
      cumulativeLoss += outcome.dailyLoss;

      if (health < 30) hitCritical = true;
      if (health <= 0) hitFailure = true;
      path.push(health);
    }

    healthPaths.push(path);
    losses.push(cumulativeLoss);
    if (hitCritical) criticalHits += 1;
    if (hitFailure) failureHits += 1;
  }

  const band: MonteCarloPoint[] = [];
  for (let day = 0; day < horizonDays; day++) {
    const dayValues = healthPaths.map((path) => path[day]).sort((a, b) => a - b);
    band.push({
      day: day + 1,
      p10: round(percentile(dayValues, 0.1), 1),
      p50: round(percentile(dayValues, 0.5), 1),
      p90: round(percentile(dayValues, 0.9), 1),
    });
  }

  const sortedLosses = [...losses].sort((a, b) => a - b);
  const expectedLoss = losses.reduce((sum, v) => sum + v, 0) / Math.max(1, losses.length);

  return {
    runs,
    band,
    expectedLoss: Math.round(expectedLoss),
    medianLoss: Math.round(percentile(sortedLosses, 0.5)),
    p95Loss: Math.round(percentile(sortedLosses, 0.95)),
    bestCaseLoss: Math.round(sortedLosses[0] ?? 0),
    criticalProbability: round(criticalHits / Math.max(1, runs), 3),
    failureProbability: round(failureHits / Math.max(1, runs), 3),
  };
}

/**
 * Runs every scenario against one charger and ranks them by net benefit
 * versus the baseline (Current Trend) scenario.
 */
export function runScenarioComparison(
  faults: FaultAnalysis[],
  chargerId: string,
  options: Partial<SimulationOptions> = {},
  scenarios: SimulationScenario[] = DEFAULT_SCENARIOS,
): ScenarioComparison | null {
  const opts: SimulationOptions = { ...DEFAULT_OPTIONS, ...options };

  const results: SimulationResult[] = [];
  for (const scenario of scenarios) {
    const result = runSimulation(faults, chargerId, scenario, opts);
    if (result) results.push(result);
  }
  if (results.length === 0) return null;

  const rows: ScenarioComparisonRow[] = results.map((result) => ({
    ...result,
    isBaseline: false,
    isBest: false,
    savingsVsBaseline: 0,
    extraMaintenanceVsBaseline: 0,
    netBenefitVsBaseline: 0,
    deltaHealthVsBaseline: 0,
  }));

  const baseline = rows.find((r) => r.scenario.id === 'current') ?? rows[0];
  for (const row of rows) {
    row.isBaseline = row === baseline;
    row.savingsVsBaseline = baseline.totalProjectedLoss - row.totalProjectedLoss;
    row.extraMaintenanceVsBaseline = row.maintenanceCost - baseline.maintenanceCost;
    row.netBenefitVsBaseline = row.savingsVsBaseline - row.extraMaintenanceVsBaseline;
    row.deltaHealthVsBaseline = round(row.finalHealthScore - baseline.finalHealthScore, 1);
  }

  let best = rows[0];
  for (const row of rows) {
    if (row.netBenefitVsBaseline > best.netBenefitVsBaseline) best = row;
  }
  best.isBest = true;

  return {
    chargerId,
    horizonDays: opts.horizonDays,
    economics: opts.economics,
    baselineId: baseline.scenario.id,
    bestScenarioId: best.scenario.id,
    rows,
    bestNetBenefit: best.netBenefitVsBaseline,
    recommendation: buildComparisonRecommendation(baseline, best),
  };
}

/**
 * Single actionable takeaway: what today’s trajectory does, what the best
 * scenario changes, and the risk-adjusted numbers behind it.
 */
function buildComparisonRecommendation(
  baseline: ScenarioComparisonRow,
  best: ScenarioComparisonRow,
): string {
  const horizon = `${baseline.projections.length}-day`;
  const parts: string[] = [];

  // 1. Where the current trend lands
  if (baseline.currentHealthScore < 30) {
    parts.push(
      `URGENT — this charger is already Critical at ${baseline.currentHealthScore}/100; inspect it before the next session.`,
    );
  } else if (baseline.daysUntilFailure !== null) {
    parts.push(
      `On the current trend health reaches 0 in ~${baseline.daysUntilFailure} days (₹${baseline.totalProjectedLoss.toLocaleString('en-IN')} projected loss over ${horizon}).`,
    );
  } else if (baseline.daysUntilCritical !== null) {
    parts.push(
      `On the current trend health drops below 30 in ~${baseline.daysUntilCritical} days (₹${baseline.totalProjectedLoss.toLocaleString('en-IN')} projected loss over ${horizon}).`,
    );
  } else {
    parts.push(
      `Current Trend ends at ${baseline.finalHealthScore}/100 with a projected ${horizon} loss of ₹${baseline.totalProjectedLoss.toLocaleString('en-IN')}.`,
    );
  }

  // 2. Best available move
  if (best.isBaseline) {
    parts.push(
      `Current Trend is already the best of the scenarios modelled — no alternative pays for itself here.`,
    );
  } else if (best.netBenefitVsBaseline > 0) {
    parts.push(
      `Move to “${best.scenario.name}”: net benefit ₹${best.netBenefitVsBaseline.toLocaleString('en-IN')} (₹${best.savingsVsBaseline.toLocaleString('en-IN')} less downtime loss for ₹${best.extraMaintenanceVsBaseline.toLocaleString('en-IN')} extra maintenance), ending at ${best.finalHealthScore}/100 vs ${baseline.finalHealthScore}/100.`,
    );
  } else {
    parts.push(
      `No scenario beats the current trend economically — prioritise the levers in “What Drives It” instead of spending on extra maintenance.`,
    );
  }

  // 3. Risk-adjusted context from the baseline Monte Carlo
  const mc = baseline.monteCarlo;
  if (mc && mc.criticalProbability > 0) {
    parts.push(
      `Across ${mc.runs} simulated futures: ${Math.round(mc.criticalProbability * 100)}% chance of dipping below 30, p95 loss ₹${mc.p95Loss.toLocaleString('en-IN')}.`,
    );
  }

  return parts.join(' ');
}

function generateRecommendation(result: SimulationResult): string {
  const horizon = `${result.projections.length}-day`;
  const loss = `₹${result.totalProjectedLoss.toLocaleString('en-IN')}`;

  if (result.daysUntilFailure !== null && result.daysUntilFailure <= 30) {
    return `URGENT: total failure projected in ~${result.daysUntilFailure} days at current trajectory. Take the charger offline for a full hardware inspection. Projected ${horizon} loss without action: ${loss}.`;
  }

  if (result.daysUntilCritical !== null && result.daysUntilCritical <= 45) {
    return `Health will drop below 30 in ~${result.daysUntilCritical} days. Reduce maintenance interval to ${Math.max(7, Math.floor(result.scenario.maintenanceIntervalDays / 2))} days and inspect cooling/power systems. Projected ${horizon} loss: ${loss}.`;
  }

  if (result.finalHealthScore >= 80) {
    return `This charger stays healthy (${result.finalHealthScore}/100) under current settings. Maintain the ${result.scenario.maintenanceIntervalDays}-day schedule. Projected ${horizon} loss: ${loss}.`;
  }

  return `Health ends at ${result.finalHealthScore}/100 with a projected ${horizon} loss of ${loss}. Reduce maintenance interval to prevent further degradation.`;
}

/**
 * One-at-a-time sensitivity: move each scenario parameter ±20% (clamped to
 * slider bounds) and measure how much projected loss swings.
 */
export function runSensitivityAnalysis(
  faults: FaultAnalysis[],
  chargerId: string,
  scenario: SimulationScenario,
  options: Partial<SimulationOptions> = {},
): SensitivityItem[] {
  const opts: SimulationOptions = { ...DEFAULT_OPTIONS, ...options };
  const base = runSimulation(faults, chargerId, scenario, { ...opts, monteCarloRuns: 0 });
  if (!base) return [];

  const baseLoss = Math.max(1, base.totalProjectedLoss);
  const items: SensitivityItem[] = [];

  for (const key of Object.keys(PARAM_LABELS) as (keyof typeof PARAM_LABELS)[]) {
    const bounds = SCENARIO_BOUNDS[key];
    const original = scenario[key] as number;
    const delta = Math.max(bounds.step, Math.abs(original) * 0.2);

    const lowScenario = { ...scenario, [key]: clamp(original - delta, bounds.min, bounds.max) };
    const highScenario = { ...scenario, [key]: clamp(original + delta, bounds.min, bounds.max) };

    const lowResult = runSimulation(faults, chargerId, lowScenario, { ...opts, monteCarloRuns: 0 });
    const highResult = runSimulation(faults, chargerId, highScenario, { ...opts, monteCarloRuns: 0 });
    if (!lowResult || !highResult) continue;

    const lowLoss = lowResult.totalProjectedLoss;
    const highLoss = highResult.totalProjectedLoss;
    const swing = Math.abs(highLoss - lowLoss);

    items.push({
      key,
      label: PARAM_LABELS[key],
      lowLoss,
      highLoss,
      swing,
      swingPct: swing / baseLoss,
      hint: PARAM_HINTS[key],
    });
  }

  return items.sort((a, b) => b.swing - a.swing);
}

export function getUniqueChargerIds(faults: FaultAnalysis[]): string[] {
  const ids = new Set<string>();
  faults.forEach((f) => {
    ids.add(f.logEntry.chargerId || f.connectorId || 'Unknown');
  });
  return Array.from(ids).sort();
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
