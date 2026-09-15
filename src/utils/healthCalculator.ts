import type { FaultAnalysis } from '@/types/fault';

interface HealthData {
  chargerId: string;
  healthScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  patterns: string[];
  faultCount: number;
  lastFaultDate: string;
  estimatedLoss: number;
}

// Context-Aware Intelligence Engine: Sensor thresholds for severity scaling
const SENSOR_THRESHOLDS = {
  temperature: {
    critical: 80,
    high: 70,
    medium: 60
  },
  voltage: {
    overvoltageCritical: 520,
    overvoltageHigh: 500,
    undervoltageCritical: 180,
    undervoltageHigh: 200
  },
  current: {
    critical: 100,
    high: 80,
    medium: 70
  }
};

// Context-Aware Intelligence Engine: Time window for recurrence analysis (in milliseconds)
const RECURRENCE_TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Context-Aware Intelligence Engine: Recurrence-based severity escalation
 * Analyzes fault patterns within a time window and escalates severity if needed
 */
function escalateSeverityByRecurrence(
  fault: FaultAnalysis,
  allFaults: FaultAnalysis[]
): 'Critical' | 'High' | 'Medium' | 'Low' {
  const faultTime = new Date(fault.timestamp).getTime();
  const windowStart = faultTime - RECURRENCE_TIME_WINDOW;
  
  // Find similar faults on the same charger within time window
  const recentSimilarFaults = allFaults.filter(f => {
    const fTime = new Date(f.timestamp).getTime();
    return f.connectorId === fault.connectorId &&
           f.faultType === fault.faultType &&
           fTime >= windowStart &&
           fTime <= faultTime;
  });

  const recurrenceCount = recentSimilarFaults.length;
  
  // Escalate severity based on recurrence
  if (recurrenceCount >= 5) {
    return 'Critical'; // 5+ occurrences = Critical
  } else if (recurrenceCount >= 3) {
    return 'High'; // 3-4 occurrences = High
  } else if (recurrenceCount >= 2) {
    return 'Medium'; // 2 occurrences = Medium
  }
  
  return fault.severity; // Keep original severity
}

/**
 * Context-Aware Intelligence Engine: Sensor-driven severity scaling
 * Evaluates sensor readings against thresholds to determine true severity
 */
function scaleSeverityBySensors(fault: FaultAnalysis): 'Critical' | 'High' | 'Medium' | 'Low' {
  const entry = fault.logEntry;
  let escalatedSeverity = fault.severity;

  // Temperature-based escalation
  if (entry.temperature !== undefined) {
    if (entry.temperature >= SENSOR_THRESHOLDS.temperature.critical) {
      escalatedSeverity = 'Critical';
    } else if (entry.temperature >= SENSOR_THRESHOLDS.temperature.high && escalatedSeverity !== 'Critical') {
      escalatedSeverity = 'High';
    }
  }

  // Voltage-based escalation
  if (entry.voltage !== undefined) {
    if (entry.voltage >= SENSOR_THRESHOLDS.voltage.overvoltageCritical || 
        entry.voltage <= SENSOR_THRESHOLDS.voltage.undervoltageCritical) {
      escalatedSeverity = 'Critical';
    } else if ((entry.voltage >= SENSOR_THRESHOLDS.voltage.overvoltageHigh || 
                entry.voltage <= SENSOR_THRESHOLDS.voltage.undervoltageHigh) && 
               escalatedSeverity !== 'Critical') {
      escalatedSeverity = 'High';
    }
  }

  // Current-based escalation
  if (entry.current !== undefined) {
    if (entry.current >= SENSOR_THRESHOLDS.current.critical) {
      escalatedSeverity = 'Critical';
    } else if (entry.current >= SENSOR_THRESHOLDS.current.high && escalatedSeverity !== 'Critical') {
      escalatedSeverity = 'High';
    }
  }

  return escalatedSeverity;
}

/**
 * Context-Aware Intelligence Engine: Dynamic charger health scoring
 * Calculates rolling health score based on fault impact, frequency, and recency
 */
export function calculateHealthData(faults: FaultAnalysis[]): HealthData[] {
  // Group faults by charger/connector
  const chargerFaults = new Map<string, FaultAnalysis[]>();
  
  faults.forEach(fault => {
    const key = fault.connectorId || 'Unknown';
    if (!chargerFaults.has(key)) {
      chargerFaults.set(key, []);
    }
    chargerFaults.get(key)!.push(fault);
  });

  const healthDataList: HealthData[] = [];

  chargerFaults.forEach((chargerFaultList, chargerId) => {
    // Apply Context-Aware Intelligence: Escalate severity based on recurrence and sensors
    const enhancedFaults = chargerFaultList.map(fault => {
      const recurrenceSeverity = escalateSeverityByRecurrence(fault, chargerFaultList);
      const sensorSeverity = scaleSeverityBySensors(fault);
      
      // Take the highest severity from both analyses
      const severityLevels = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
      const finalSeverity = severityLevels[recurrenceSeverity] > severityLevels[sensorSeverity] 
        ? recurrenceSeverity 
        : sensorSeverity;
      
      return { ...fault, severity: finalSeverity };
    });

    const faultCount = enhancedFaults.length;
    const criticalCount = enhancedFaults.filter(f => f.severity === 'Critical').length;
    const highSeverityCount = enhancedFaults.filter(f => f.severity === 'High').length;
    const mediumSeverityCount = enhancedFaults.filter(f => f.severity === 'Medium').length;
    
    // Dynamic health score calculation with recency weighting
    let healthScore = 100;
    const now = Date.now();
    
    enhancedFaults.forEach(fault => {
      const faultAge = now - new Date(fault.timestamp).getTime();
      const daysSinceFault = faultAge / (24 * 60 * 60 * 1000);
      
      // Recent faults have more impact (exponential decay over 30 days)
      const recencyWeight = Math.exp(-daysSinceFault / 30);
      
      // Severity-based deduction with recency weighting
      if (fault.severity === 'Critical') {
        healthScore -= 20 * recencyWeight;
      } else if (fault.severity === 'High') {
        healthScore -= 15 * recencyWeight;
      } else if (fault.severity === 'Medium') {
        healthScore -= 8 * recencyWeight;
      } else {
        healthScore -= 3 * recencyWeight;
      }
    });
    
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Determine risk level with enhanced logic
    let riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    if (healthScore < 30 || criticalCount >= 2) {
      riskLevel = 'Critical';
    } else if (healthScore < 50 || highSeverityCount >= 3 || criticalCount >= 1) {
      riskLevel = 'High';
    } else if (healthScore < 70 || mediumSeverityCount >= 3) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    // Detect patterns with enhanced intelligence
    const patterns: string[] = [];
    const faultTypes = enhancedFaults.map(f => f.faultType);
    const faultTypeCounts = new Map<string, number>();
    
    faultTypes.forEach(type => {
      faultTypeCounts.set(type, (faultTypeCounts.get(type) || 0) + 1);
    });

    // Recurrence pattern detection
    faultTypeCounts.forEach((count, type) => {
      if (count >= 5) {
        patterns.push(`⚠️ Critical recurrence: ${type} (${count}x in 24h)`);
      } else if (count >= 3) {
        patterns.push(`Recurring ${type} (${count}x)`);
      }
    });

    // Sensor-based pattern detection
    const highTempFaults = enhancedFaults.filter(f => 
      f.logEntry.temperature && f.logEntry.temperature > SENSOR_THRESHOLDS.temperature.high
    );
    if (highTempFaults.length > 0) {
      const maxTemp = Math.max(...highTempFaults.map(f => f.logEntry.temperature || 0));
      patterns.push(`🌡️ Temperature issues detected (peak: ${maxTemp}°C)`);
    }

    // Network issues
    const networkFaults = enhancedFaults.filter(f => f.faultType === 'OCPP network disconnect');
    if (networkFaults.length >= 2) {
      patterns.push(`📡 Network connectivity problems (${networkFaults.length}x)`);
    }

    // Power issues
    const powerFaults = enhancedFaults.filter(f => 
      f.faultType === 'Overvoltage' || 
      f.faultType === 'Low grid voltage' ||
      f.faultType === 'Power module failure'
    );
    if (powerFaults.length >= 2) {
      patterns.push(`⚡ Power supply instability (${powerFaults.length}x)`);
    }

    // Get last fault date
    const sortedFaults = [...enhancedFaults].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastFaultDate = sortedFaults[0]?.timestamp || new Date().toISOString();

    // Estimate loss (₹120 per fault hour on average)
    const totalDowntime = enhancedFaults.reduce((sum, f) => sum + f.downtime, 0);
    const estimatedLoss = totalDowntime * 120 * 14 / 24; // avg sessions per day * avg ticket

    healthDataList.push({
      chargerId,
      healthScore: Math.round(healthScore),
      riskLevel,
      patterns: patterns.length > 0 ? patterns : ['✅ No significant patterns detected'],
      faultCount,
      lastFaultDate,
      estimatedLoss: Math.round(estimatedLoss),
    });
  });

  // Sort by health score (worst first)
  return healthDataList.sort((a, b) => a.healthScore - b.healthScore);
}
