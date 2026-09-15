import type { FaultAnalysis, FaultType, SeverityLevel } from '@/types/fault';

export interface RootCauseNode {
  id: string;
  faultType: FaultType;
  severity: SeverityLevel;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  description: string;
  rootCause: string;
  resolution: string;
  confidence: number; // 0-100 confidence in this root cause
  children: RootCauseNode[];
  relatedFaults: string[]; // IDs of related fault types
}

export interface AlertChain {
  id: string;
  chargerId: string;
  severity: SeverityLevel;
  chainDepth: number;
  totalFaults: number;
  timeSpan: string;
  rootCause: RootCauseNode;
  estimatedRevenueLoss: number;
  priority: 'immediate' | 'urgent' | 'scheduled' | 'monitor';
  actionDeadline: string;
}

export interface AlertSummary {
  totalChains: number;
  immediateCount: number;
  urgentCount: number;
  scheduledCount: number;
  monitorCount: number;
  totalEstimatedLoss: number;
  mostCommonRootCause: string;
  highestRiskCharger: string;
}

// Known fault correlation rules (fault A often causes fault B)
const FAULT_CORRELATIONS: Record<string, { causes: string[]; confidence: number }[]> = {
  Overheating: [
    { causes: ['Overcurrent', 'Power module failure'], confidence: 85 },
    { causes: ['Repeated soft restarts'], confidence: 70 },
  ],
  Overcurrent: [
    { causes: ['Overheating', 'Power module failure'], confidence: 80 },
    { causes: ['Contactor stuck'], confidence: 60 },
  ],
  Overvoltage: [
    { causes: ['Low grid voltage', 'Power module failure'], confidence: 75 },
    { causes: ['Overcurrent'], confidence: 65 },
  ],
  'Low grid voltage': [
    { causes: ['Overvoltage', 'Repeated soft restarts'], confidence: 70 },
  ],
  'OCPP network disconnect': [
    { causes: ['Repeated soft restarts'], confidence: 60 },
  ],
  'Power module failure': [
    { causes: ['Overcurrent', 'Overheating', 'Contactor stuck'], confidence: 90 },
  ],
  'Repeated soft restarts': [
    { causes: ['Power module failure', 'OCPP network disconnect'], confidence: 75 },
  ],
  'Contactor stuck': [
    { causes: ['Power module failure', 'Overcurrent'], confidence: 85 },
  ],
  'Emergency stop': [
    { causes: ['Overheating', 'Overcurrent', 'Contactor stuck'], confidence: 80 },
  ],
};

// Root cause analysis chains
const ROOT_CAUSE_CHAINS: Record<
  string,
  { cause: string; effect: string; confidence: number; resolution: string }[]
> = {
  Overheating: [
    {
      cause: 'Cooling fan failure or blocked ventilation',
      effect: 'Internal temperature rises above 70°C threshold',
      confidence: 85,
      resolution: 'Inspect and clean cooling fans, clear ventilation obstructions',
    },
    {
      cause: 'Continuous high-power operation without cooldown',
      effect: 'Thermal buildup exceeds dissipation capacity',
      confidence: 75,
      resolution: 'Implement scheduled cooldown periods during peak hours',
    },
    {
      cause: 'Ambient temperature above 45°C',
      effect: 'Reduced thermal margin for heat dissipation',
      confidence: 60,
      resolution: 'Install shade structures, consider liquid cooling upgrade',
    },
  ],
  Overcurrent: [
    {
      cause: 'Faulty current sensor providing incorrect readings',
      effect: 'Charger delivers more current than vehicle can accept',
      confidence: 80,
      resolution: 'Calibrate or replace current sensor, verify BMS communication',
    },
    {
      cause: 'Vehicle BMS requesting excessive current',
      effect: 'Overcurrent protection triggers session termination',
      confidence: 70,
      resolution: 'Update vehicle BMS firmware, check charger-vehicle compatibility',
    },
  ],
  'Power module failure': [
    {
      cause: 'AC-DC converter component degradation',
      effect: 'Power conversion efficiency drops, module overheats',
      confidence: 90,
      resolution: 'Replace power module, inspect for electrolytic capacitor aging',
    },
    {
      cause: 'Voltage spike from grid instability',
      effect: 'Power electronics damaged beyond repair',
      confidence: 85,
      resolution: 'Install surge protection, replace power module',
    },
  ],
  Overvoltage: [
    {
      cause: 'Grid voltage fluctuation outside 180-520V range',
      effect: 'Internal voltage regulator overwhelmed',
      confidence: 80,
      resolution: 'Install voltage stabilizer, contact utility provider',
    },
    {
      cause: 'Internal voltage regulator malfunction',
      effect: 'Output voltage exceeds safe limits',
      confidence: 75,
      resolution: 'Replace voltage regulation circuit board',
    },
  ],
  'OCPP network disconnect': [
    {
      cause: 'Internet connectivity loss at site',
      effect: 'OCPP connection drops, charger goes offline',
      confidence: 85,
      resolution: 'Check router/modem, install backup cellular connection',
    },
    {
      cause: 'Backend server downtime',
      effect: 'Charger cannot authenticate or report status',
      confidence: 70,
      resolution: 'Contact backend team, implement offline transaction caching',
    },
  ],
  'Contactor stuck': [
    {
      cause: 'Contactor coil degradation from repeated switching',
      effect: 'Mechanical contacts weld shut or fail to close',
      confidence: 85,
      resolution: 'Replace contactor assembly, reduce switching frequency',
    },
    {
      cause: 'Arc damage from high-current switching',
      effect: 'Contact surfaces roughen, increasing resistance',
      confidence: 80,
      resolution: 'Replace contactor, install arc suppression circuit',
    },
  ],
};

function groupFaultsByType(
  faults: FaultAnalysis[],
): Map<FaultType, FaultAnalysis[]> {
  const groups = new Map<FaultType, FaultAnalysis[]>();
  faults.forEach((f) => {
    const existing = groups.get(f.faultType) || [];
    existing.push(f);
    groups.set(f.faultType, existing);
  });
  return groups;
}

function buildRootCauseTree(
  faults: FaultAnalysis[],
  faultType: FaultType,
  depth: number = 0,
  visited: Set<string> = new Set(),
): RootCauseNode | null {
  if (visited.has(faultType) || depth > 3) return null;
  visited.add(faultType);

  const typeFaults = faults.filter((f) => f.faultType === faultType);
  if (typeFaults.length === 0) return null;

  const sorted = [...typeFaults].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Determine severity (highest among all occurrences)
  const severityOrder: Record<string, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };
  const highestSeverity = sorted.reduce(
    (max, f) => (severityOrder[f.severity] > severityOrder[max] ? f.severity : max),
    sorted[0].severity,
  );

  // Get root cause info
  const chainInfo = ROOT_CAUSE_CHAINS[faultType];
  const description = chainInfo?.[0]?.effect || typeFaults[0].description;
  const rootCause = chainInfo?.[0]?.cause || typeFaults[0].rootCause;
  const resolution = chainInfo?.[0]?.resolution || typeFaults[0].resolution;
  const confidence = chainInfo?.[0]?.confidence || 70;

  // Find related faults (correlations)
  const correlations = FAULT_CORRELATIONS[faultType] || [];
  const relatedFaultTypes = new Set<string>();
  correlations.forEach((corr) => {
    corr.causes.forEach((cause) => {
      if (faults.some((f) => f.faultType === cause)) {
        relatedFaultTypes.add(cause);
      }
    });
  });

  // Build children (related faults that are likely consequences)
  const children: RootCauseNode[] = [];
  relatedFaultTypes.forEach((relatedType) => {
    const child = buildRootCauseTree(
      faults,
      relatedType as FaultType,
      depth + 1,
      new Set(visited),
    );
    if (child) children.push(child);
  });

  return {
    id: `${faultType}-${depth}`,
    faultType,
    severity: highestSeverity,
    count: typeFaults.length,
    firstOccurrence: sorted[0].timestamp,
    lastOccurrence: sorted[sorted.length - 1].timestamp,
    description,
    rootCause,
    resolution,
    confidence,
    children,
    relatedFaults: Array.from(relatedFaultTypes),
  };
}

function calculatePriority(
  severity: SeverityLevel,
  faultCount: number,
): AlertChain['priority'] {
  if (severity === 'Critical' && faultCount >= 3) return 'immediate';
  if (severity === 'Critical' || (severity === 'High' && faultCount >= 5)) return 'urgent';
  if (severity === 'High' || (severity === 'Medium' && faultCount >= 3)) return 'scheduled';
  return 'monitor';
}

function getActionDeadline(priority: AlertChain['priority']): string {
  const now = new Date();
  switch (priority) {
    case 'immediate':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    case 'urgent':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
    case 'scheduled':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    case 'monitor':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  }
}

function estimateChainLoss(faults: FaultAnalysis[]): number {
  const DOWNTIME_MAP: Record<string, number> = {
    Critical: 8,
    High: 4,
    Medium: 2,
    Low: 0.5,
  };
  return faults.reduce((sum, f) => {
    const downtime = DOWNTIME_MAP[f.severity] || 1;
    return sum + downtime * 120; // ₹120 per hour
  }, 0);
}

export function analyzeAlertChains(faults: FaultAnalysis[]): AlertChain[] {
  // Group faults by charger
  const chargerGroups = new Map<string, FaultAnalysis[]>();
  faults.forEach((f) => {
    const chargerId = f.logEntry.chargerId || f.connectorId || 'Unknown';
    const existing = chargerGroups.get(chargerId) || [];
    existing.push(f);
    chargerGroups.set(chargerId, existing);
  });

  const chains: AlertChain[] = [];

  chargerGroups.forEach((chargerFaults, chargerId) => {
    // Find the root fault type (most frequent or highest severity)
    const typeGroups = groupFaultsByType(chargerFaults);
    let rootType: FaultType = 'Overheating';
    let maxScore = 0;

    typeGroups.forEach((typeFaults, type) => {
      const severityScore =
        typeFaults.reduce(
          (sum, f) => sum + ({ Critical: 4, High: 3, Medium: 2, Low: 1 }[f.severity] || 1),
          0,
        ) / typeFaults.length;
      const frequencyScore = typeFaults.length;
      const score = severityScore * 0.6 + Math.min(frequencyScore, 10) * 0.4;

      if (score > maxScore) {
        maxScore = score;
        rootType = type;
      }
    });

    // Build root cause tree
    const visited = new Set<string>();
    const rootCause = buildRootCauseTree(chargerFaults, rootType, 0, visited);
    if (!rootCause) return;

    // Determine chain depth
    const getDepth = (node: RootCauseNode): number => {
      if (node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    };

    // Determine overall severity
    const allSeverities = chargerFaults.map((f) => f.severity);
    const highestSeverity = allSeverities.reduce(
      (max, s) => ({ Critical: 4, High: 3, Medium: 2, Low: 1 }[s] > ({ Critical: 4, High: 3, Medium: 2, Low: 1 }[max] || 0) ? s : max),
      'Low' as SeverityLevel,
    );

    // Calculate time span
    const timestamps = chargerFaults.map((f) => new Date(f.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const spanDays = Math.ceil((maxTime - minTime) / (24 * 60 * 60 * 1000));
    const timeSpan = spanDays <= 1 ? '24 hours' : spanDays <= 7 ? `${spanDays} days` : `${Math.ceil(spanDays / 7)} weeks`;

    const priority = calculatePriority(
      highestSeverity,
      chargerFaults.length,
    );

    chains.push({
      id: `chain-${chargerId}`,
      chargerId,
      severity: highestSeverity,
      chainDepth: getDepth(rootCause),
      totalFaults: chargerFaults.length,
      timeSpan,
      rootCause,
      estimatedRevenueLoss: estimateChainLoss(chargerFaults),
      priority,
      actionDeadline: getActionDeadline(priority),
    });
  });

  // Sort: immediate first, then by loss
  const priorityOrder = { immediate: 0, urgent: 1, scheduled: 2, monitor: 3 };
  return chains.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.estimatedRevenueLoss - a.estimatedRevenueLoss;
  });
}

export function getAlertSummary(chains: AlertChain[]): AlertSummary {
  const immediateCount = chains.filter((c) => c.priority === 'immediate').length;
  const urgentCount = chains.filter((c) => c.priority === 'urgent').length;
  const scheduledCount = chains.filter((c) => c.priority === 'scheduled').length;
  const monitorCount = chains.filter((c) => c.priority === 'monitor').length;
  const totalEstimatedLoss = chains.reduce((sum, c) => sum + c.estimatedRevenueLoss, 0);

  // Find most common root cause
  const rootCauseCounts = new Map<string, number>();
  chains.forEach((c) => {
    const cause = c.rootCause.rootCause;
    rootCauseCounts.set(cause, (rootCauseCounts.get(cause) || 0) + 1);
  });
  let mostCommonRootCause = 'N/A';
  let maxCount = 0;
  rootCauseCounts.forEach((count, cause) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonRootCause = cause;
    }
  });

  // Find highest risk charger
  const highestRiskCharger =
    chains.find((c) => c.priority === 'immediate')?.chargerId ||
    chains[0]?.chargerId ||
    'N/A';

  return {
    totalChains: chains.length,
    immediateCount,
    urgentCount,
    scheduledCount,
    monitorCount,
    totalEstimatedLoss: Math.round(totalEstimatedLoss),
    mostCommonRootCause,
    highestRiskCharger,
  };
}
