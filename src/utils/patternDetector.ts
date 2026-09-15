import type { FaultAnalysis } from '@/types/fault';
import type { PatternDetection, RiskLevel, PredictiveAlert, ChargerHealth, PredictiveSummary } from '@/types/predictive';

interface ChargerFaults {
  chargerId: string;
  connectorId?: string;
  faults: FaultAnalysis[];
}

// Helper function to group faults by charger
export function groupFaultsByCharger(faults: FaultAnalysis[]): ChargerFaults[] {
  const chargerMap = new Map<string, FaultAnalysis[]>();
  
  faults.forEach(fault => {
    const chargerId = fault.logEntry.chargerId || fault.connectorId || 'UNKNOWN';
    const key = `${chargerId}-${fault.connectorId || 'all'}`;
    if (!chargerMap.has(key)) {
      chargerMap.set(key, []);
    }
    chargerMap.get(key)!.push(fault);
  });
  
  return Array.from(chargerMap.entries()).map(([, faults]) => ({
    chargerId: faults[0].logEntry.chargerId || faults[0].connectorId || 'UNKNOWN',
    connectorId: faults[0].connectorId,
    faults
  }));
}

// Helper function to filter faults by time window
function filterByTimeWindow(faults: FaultAnalysis[], days: number): FaultAnalysis[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return faults.filter(fault => {
    const faultDate = new Date(fault.timestamp);
    return faultDate >= cutoffDate;
  });
}

// Helper function to filter faults by time window in hours
function filterByHours(faults: FaultAnalysis[], hours: number): FaultAnalysis[] {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hours);
  
  return faults.filter(fault => {
    const faultDate = new Date(fault.timestamp);
    return faultDate >= cutoffDate;
  });
}

// Pattern 1: Overheating detection (3+ times in 7 days)
function detectOverheating(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByTimeWindow(faults, 7);
  const overheatingFaults = recentFaults.filter(f => 
    f.faultType === 'Overheating' || 
    f.logEntry.errorCode?.toLowerCase().includes('temp') ||
    f.logEntry.errorCode?.toLowerCase().includes('overheat')
  );
  
  return {
    patternType: 'Overheating',
    count: overheatingFaults.length,
    threshold: 3,
    timeWindow: '7 days',
    detected: overheatingFaults.length >= 3
  };
}

// Pattern 2: OCPP disconnect detection (>6 times in 24 hours)
function detectOCPPDisconnect(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByHours(faults, 24);
  const ocppFaults = recentFaults.filter(f => 
    f.faultType === 'OCPP network disconnect' ||
    f.logEntry.errorCode?.toLowerCase().includes('ocpp') ||
    f.logEntry.errorCode?.toLowerCase().includes('network')
  );
  
  return {
    patternType: 'OCPP Disconnect',
    count: ocppFaults.length,
    threshold: 6,
    timeWindow: '24 hours',
    detected: ocppFaults.length > 6
  };
}

// Pattern 3: Voltage fluctuation detection (>10% repeatedly)
function detectVoltageFluctuation(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByTimeWindow(faults, 7);
  const voltageFaults = recentFaults.filter(f => 
    f.faultType === 'Overvoltage' ||
    f.faultType === 'Low grid voltage' ||
    f.logEntry.errorCode?.toLowerCase().includes('voltage') ||
    f.logEntry.errorCode?.toLowerCase().includes('volt')
  );
  
  return {
    patternType: 'Voltage Fluctuation',
    count: voltageFaults.length,
    threshold: 5,
    timeWindow: '7 days',
    detected: voltageFaults.length >= 5
  };
}

// Pattern 4: Repeated restarts detection (>4/day)
function detectRepeatedRestarts(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByHours(faults, 24);
  const restartFaults = recentFaults.filter(f => 
    f.faultType === 'Repeated soft restarts' ||
    f.logEntry.errorCode?.toLowerCase().includes('restart') ||
    f.logEntry.errorCode?.toLowerCase().includes('reboot')
  );
  
  return {
    patternType: 'Repeated Restarts',
    count: restartFaults.length,
    threshold: 4,
    timeWindow: '24 hours',
    detected: restartFaults.length > 4
  };
}

// Pattern 5: Vehicle-aborted sessions detection (5+ sessions)
function detectVehicleAborts(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByTimeWindow(faults, 7);
  const abortFaults = recentFaults.filter(f => 
    f.faultType === 'Vehicle-side abort' ||
    f.logEntry.errorCode?.toLowerCase().includes('abort') ||
    f.logEntry.errorCode?.toLowerCase().includes('evdisconnect')
  );
  
  return {
    patternType: 'Vehicle Aborts',
    count: abortFaults.length,
    threshold: 5,
    timeWindow: '7 days',
    detected: abortFaults.length >= 5
  };
}

// Pattern 6: Power module imbalance detection
function detectPowerModuleIssues(faults: FaultAnalysis[]): PatternDetection {
  const recentFaults = filterByTimeWindow(faults, 7);
  const powerFaults = recentFaults.filter(f => 
    f.faultType === 'Power module failure' ||
    f.faultType === 'Overcurrent' ||
    f.logEntry.errorCode?.toLowerCase().includes('power') ||
    f.logEntry.errorCode?.toLowerCase().includes('current')
  );
  
  return {
    patternType: 'Power Module Issues',
    count: powerFaults.length,
    threshold: 3,
    timeWindow: '7 days',
    detected: powerFaults.length >= 3
  };
}

// Calculate risk level based on detected patterns
function calculateRiskLevel(patterns: PatternDetection[]): RiskLevel {
  const detectedPatterns = patterns.filter(p => p.detected);
  
  if (detectedPatterns.length === 0) {
    return 'medium';
  }
  
  // Critical: Multiple patterns or very high counts
  const hasCriticalPattern = detectedPatterns.some(p => {
    if (p.patternType === 'Overheating' && p.count >= 8) return true;
    if (p.patternType === 'OCPP Disconnect' && p.count >= 16) return true;
    if (p.patternType === 'Repeated Restarts' && p.count >= 11) return true;
    if (p.patternType === 'Vehicle Aborts' && p.count >= 8) return true;
    if (p.patternType === 'Power Module Issues' && p.count >= 5) return true;
    return false;
  });
  
  if (hasCriticalPattern || detectedPatterns.length >= 3) {
    return 'critical';
  }
  
  // High: Moderate counts or multiple patterns
  const hasHighPattern = detectedPatterns.some(p => {
    if (p.patternType === 'Overheating' && p.count >= 5) return true;
    if (p.patternType === 'OCPP Disconnect' && p.count >= 11) return true;
    if (p.patternType === 'Repeated Restarts' && p.count >= 7) return true;
    if (p.patternType === 'Vehicle Aborts' && p.count >= 5) return true;
    if (p.patternType === 'Voltage Fluctuation' && p.count >= 7) return true;
    return false;
  });
  
  if (hasHighPattern || detectedPatterns.length >= 2) {
    return 'high';
  }
  
  return 'medium';
}

// Calculate health score (0-100)
function calculateHealthScore(patterns: PatternDetection[], totalFaults: number): number {
  let score = 100;
  
  // Deduct points for each detected pattern
  patterns.forEach(pattern => {
    if (pattern.detected) {
      const severity = pattern.count / pattern.threshold;
      if (pattern.patternType === 'Overheating') {
        score -= Math.min(30, severity * 10);
      } else if (pattern.patternType === 'OCPP Disconnect') {
        score -= Math.min(25, severity * 8);
      } else if (pattern.patternType === 'Power Module Issues') {
        score -= Math.min(35, severity * 12);
      } else if (pattern.patternType === 'Repeated Restarts') {
        score -= Math.min(20, severity * 7);
      } else if (pattern.patternType === 'Vehicle Aborts') {
        score -= Math.min(15, severity * 5);
      } else if (pattern.patternType === 'Voltage Fluctuation') {
        score -= Math.min(20, severity * 6);
      }
    }
  });
  
  // Deduct points for total fault count
  score -= Math.min(20, totalFaults * 0.5);
  
  return Math.max(0, Math.round(score));
}

// Generate explanation for the alert
function generateExplanation(patterns: PatternDetection[], chargerId: string, connectorId?: string): string {
  const detectedPatterns = patterns.filter(p => p.detected);
  
  if (detectedPatterns.length === 0) {
    return `Charger ${chargerId} is operating normally.`;
  }
  
  const location = connectorId ? `Connector ${connectorId}` : `Charger ${chargerId}`;
  const primaryPattern = detectedPatterns[0];
  
  const explanations: Record<string, string> = {
    'Overheating': `${location} has ${primaryPattern.count} overheating events in the past ${primaryPattern.timeWindow}. This indicates a likely cooling fan failure or blocked ventilation. The charger may shut down to prevent damage.`,
    'OCPP Disconnect': `${location} has ${primaryPattern.count} OCPP network disconnections in the past ${primaryPattern.timeWindow}. This suggests unstable network connectivity or backend server issues. Sessions may fail to start or complete.`,
    'Voltage Fluctuation': `${location} has ${primaryPattern.count} voltage-related faults in the past ${primaryPattern.timeWindow}. This indicates grid instability or faulty voltage regulation. May cause charging interruptions.`,
    'Repeated Restarts': `${location} has ${primaryPattern.count} restart events in the past ${primaryPattern.timeWindow}. This suggests firmware issues or hardware instability. Charger reliability is compromised.`,
    'Vehicle Aborts': `${location} has ${primaryPattern.count} vehicle-aborted sessions in the past ${primaryPattern.timeWindow}. This may indicate BMS communication issues or incompatibility with certain vehicle models.`,
    'Power Module Issues': `${location} has ${primaryPattern.count} power module faults in the past ${primaryPattern.timeWindow}. This indicates potential hardware failure in the power delivery system. Immediate inspection required.`
  };
  
  let explanation = explanations[primaryPattern.patternType] || `${location} shows concerning fault patterns.`;
  
  if (detectedPatterns.length > 1) {
    explanation += ` Additionally, ${detectedPatterns.length - 1} other fault pattern(s) detected, indicating multiple system issues.`;
  }
  
  return explanation;
}

// Generate recommended action
function generateRecommendedAction(patterns: PatternDetection[], riskLevel: RiskLevel): string {
  const detectedPatterns = patterns.filter(p => p.detected);
  
  if (detectedPatterns.length === 0) {
    return 'Continue regular monitoring.';
  }
  
  const primaryPattern = detectedPatterns[0];
  
  const actions: Record<string, Record<RiskLevel, string>> = {
    'Overheating': {
      medium: 'Schedule maintenance within 7 days. Check cooling fans and clean air vents.',
      high: 'Schedule maintenance within 3 days. Inspect cooling system and thermal sensors.',
      critical: 'URGENT: Service within 24 hours. Cooling system failure imminent. Consider taking charger offline.'
    },
    'OCPP Disconnect': {
      medium: 'Check network connectivity and OCPP backend status within 5 days.',
      high: 'Inspect network equipment and backend configuration within 2 days.',
      critical: 'URGENT: Network infrastructure failing. Check immediately to prevent revenue loss.'
    },
    'Voltage Fluctuation': {
      medium: 'Monitor grid voltage. Contact utility provider if issues persist.',
      high: 'Inspect voltage regulation equipment within 3 days. May need grid upgrade.',
      critical: 'URGENT: Severe grid instability. Contact electrician and utility provider immediately.'
    },
    'Repeated Restarts': {
      medium: 'Check firmware version and update if available. Monitor for 3 days.',
      high: 'Inspect hardware components and update firmware within 2 days.',
      critical: 'URGENT: Hardware failure likely. Contact vendor for immediate support.'
    },
    'Vehicle Aborts': {
      medium: 'Monitor vehicle compatibility. Update firmware if available.',
      high: 'Check BMS communication settings. May need protocol updates.',
      critical: 'URGENT: Major compatibility issues. Contact vendor for protocol fix.'
    },
    'Power Module Issues': {
      medium: 'Schedule power module inspection within 5 days.',
      high: 'Inspect power delivery system within 2 days. Check for loose connections.',
      critical: 'URGENT: Power module failure imminent. Take charger offline and service immediately.'
    }
  };
  
  let action = actions[primaryPattern.patternType]?.[riskLevel] || 'Contact technical support for diagnosis.';
  
  if (detectedPatterns.length >= 3) {
    action = 'URGENT: Multiple critical issues detected. Comprehensive system inspection required immediately. Consider taking charger offline until serviced.';
  }
  
  return action;
}

// Estimate days until failure
function estimateDaysUntilFailure(patterns: PatternDetection[], riskLevel: RiskLevel): number {
  const detectedPatterns = patterns.filter(p => p.detected);
  
  if (detectedPatterns.length === 0) {
    return 90;
  }
  
  if (riskLevel === 'critical') {
    return Math.floor(Math.random() * 3) + 1; // 1-3 days
  }
  
  if (riskLevel === 'high') {
    return Math.floor(Math.random() * 7) + 3; // 3-10 days
  }
  
  return Math.floor(Math.random() * 14) + 7; // 7-21 days
}

// Calculate estimated revenue loss
function calculateRevenueLoss(
  daysUntilFailure: number, 
  avgSessionValue: number, 
  avgSessionsPerDay: number
): number {
  // Assume charger will be down for 3-7 days after failure
  const downtime = Math.floor(Math.random() * 5) + 3;
  const totalLoss = downtime * avgSessionsPerDay * avgSessionValue;
  
  // Add opportunity cost for degraded performance before failure
  const degradationLoss = (daysUntilFailure * avgSessionsPerDay * avgSessionValue) * 0.3;
  
  return Math.round(totalLoss + degradationLoss);
}

// Main function to detect patterns and generate alerts
export function detectPredictiveAlerts(
  faults: FaultAnalysis[],
  avgSessionValue: number = 120,
  avgSessionsPerDay: number = 14
): PredictiveAlert[] {
  const chargerGroups = groupFaultsByCharger(faults);
  const alerts: PredictiveAlert[] = [];
  
  chargerGroups.forEach(group => {
    // Detect all patterns
    const patterns: PatternDetection[] = [
      detectOverheating(group.faults),
      detectOCPPDisconnect(group.faults),
      detectVoltageFluctuation(group.faults),
      detectRepeatedRestarts(group.faults),
      detectVehicleAborts(group.faults),
      detectPowerModuleIssues(group.faults)
    ];
    
    // Only create alert if at least one pattern is detected
    const hasRisk = patterns.some(p => p.detected);
    
    if (hasRisk) {
      const riskLevel = calculateRiskLevel(patterns);
      const healthScore = calculateHealthScore(patterns, group.faults.length);
      const daysUntilFailure = estimateDaysUntilFailure(patterns, riskLevel);
      const estimatedRevenueLoss = calculateRevenueLoss(daysUntilFailure, avgSessionValue, avgSessionsPerDay);
      
      alerts.push({
        chargerId: group.chargerId,
        connectorId: group.connectorId,
        riskLevel,
        healthScore,
        patterns,
        explanation: generateExplanation(patterns, group.chargerId, group.connectorId),
        recommendedAction: generateRecommendedAction(patterns, riskLevel),
        estimatedRevenueLoss,
        daysUntilFailure
      });
    }
  });
  
  // Sort by risk level (critical first) and then by health score (lowest first)
  return alerts.sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.healthScore - b.healthScore;
  });
}

// Calculate charger health for all chargers
export function calculateChargerHealth(faults: FaultAnalysis[]): ChargerHealth[] {
  const chargerGroups = groupFaultsByCharger(faults);
  
  return chargerGroups.map(group => {
    const patterns: PatternDetection[] = [
      detectOverheating(group.faults),
      detectOCPPDisconnect(group.faults),
      detectVoltageFluctuation(group.faults),
      detectRepeatedRestarts(group.faults),
      detectVehicleAborts(group.faults),
      detectPowerModuleIssues(group.faults)
    ];
    
    const hasRisk = patterns.some(p => p.detected);
    const riskLevel = hasRisk ? calculateRiskLevel(patterns) : 'low';
    const healthScore = calculateHealthScore(patterns, group.faults.length);
    const criticalPatterns = patterns.filter(p => p.detected).length;
    
    // Find most recent fault
    const sortedFaults = [...group.faults].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return {
      chargerId: group.chargerId,
      healthScore,
      riskLevel,
      totalFaults: group.faults.length,
      criticalPatterns,
      lastFaultDate: sortedFaults[0]?.timestamp || new Date().toISOString()
    };
  });
}

// Calculate predictive summary
export function calculatePredictiveSummary(alerts: PredictiveAlert[], health: ChargerHealth[]): PredictiveSummary {
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'critical').length;
  const highRiskAlerts = alerts.filter(a => a.riskLevel === 'high').length;
  const mediumRiskAlerts = alerts.filter(a => a.riskLevel === 'medium').length;
  
  const totalEstimatedLoss = alerts.reduce((sum, alert) => sum + alert.estimatedRevenueLoss, 0);
  
  const averageHealthScore = health.length > 0
    ? Math.round(health.reduce((sum, h) => sum + h.healthScore, 0) / health.length)
    : 100;
  
  return {
    totalChargers: health.length,
    atRiskChargers: alerts.length,
    criticalAlerts,
    highRiskAlerts,
    mediumRiskAlerts,
    totalEstimatedLoss,
    averageHealthScore
  };
}
