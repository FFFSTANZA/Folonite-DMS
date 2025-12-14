import type { FaultAnalysis, FaultType, SeverityLevel } from '@/types/fault';
import type { SessionData, SiteMetrics, ChargerMetrics } from '@/types/analytics';
import { calculateHealthData } from './healthCalculator';

interface HealthData {
  chargerId: string;
  healthScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  patterns: string[];
  faultCount: number;
  lastFaultDate: string;
  estimatedLoss: number;
}

interface SampleDataResult {
  faults: FaultAnalysis[];
  sessions: SessionData[];
  siteMetrics: SiteMetrics[];
  chargerMetrics: ChargerMetrics[];
  healthData: HealthData[];
}

const faultTypes: FaultType[] = [
  'Overcurrent',
  'Overvoltage',
  'Low grid voltage',
  'Overheating',
  'BMS communication mismatch',
  'OCPP network disconnect',
  'Power module failure',
  'Vehicle-side abort',
  'Emergency stop',
  'Contactor stuck',
  'Repeated soft restarts',
];

const severityLevels: SeverityLevel[] = ['Critical', 'High', 'Medium', 'Low'];

const connectorIds = [
  'CHG-MUM-01',
  'CHG-MUM-02',
  'CHG-DEL-01',
  'CHG-DEL-02',
  'CHG-BLR-01',
  'CHG-BLR-02',
  'CHG-HYD-01',
  'CHG-CHN-01',
  'CHG-PUN-01',
  'CHG-KOL-01',
];

function generateSampleFaults(): FaultAnalysis[] {
  const faults: FaultAnalysis[] = [];
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate 50 faults to ensure comprehensive data
  for (let i = 0; i < 50; i++) {
    const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    let severity: SeverityLevel;
    
    // Ensure we have a good mix of severities, with some Critical ones
    if (i < 5) {
      severity = 'Critical'; // First 5 are Critical
    } else if (i < 15) {
      severity = 'High'; // Next 10 are High
    } else if (i < 30) {
      severity = 'Medium'; // Next 15 are Medium
    } else {
      severity = 'Low'; // Rest are Low
    }
    
    const connectorId = connectorIds[Math.floor(Math.random() * connectorIds.length)];
    
    // Ensure some faults are from today for "Today's Faults" metric
    let timestamp: string;
    if (i < 8) {
      // First 8 faults are from today
      const todayTime = today.getTime() + Math.random() * 24 * 60 * 60 * 1000;
      timestamp = new Date(todayTime).toISOString();
    } else {
      // Rest are from the past 7 days
      timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    // Create recurring faults for the same charger to trigger pattern detection
    let actualConnectorId = connectorId;
    if (i >= 5 && i < 10) {
      // Create recurring overheating issues for CHG-MUM-01
      actualConnectorId = 'CHG-MUM-01';
      faults.push({
        id: `fault-${i + 1}`,
        faultType: 'Overheating',
        timestamp,
        connectorId: actualConnectorId,
        description: getFaultDescription('Overheating'),
        rootCause: getRootCause('Overheating'),
        impact: getImpact(severity),
        severity,
        resolution: getResolution('Overheating'),
        downtime: Math.round((severity === 'Critical' ? Math.random() * 12 + 8 :
                             severity === 'High' ? Math.random() * 8 + 4 : 
                             severity === 'Medium' ? Math.random() * 4 + 1 : 
                             Math.random() * 2) * 10) / 10,
        logEntry: {
          errorCode: `ERR-${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp,
          connectorId: actualConnectorId,
          rawData: '',
          temperature: 85 + Math.random() * 15, // High temperature
        },
      });
      continue;
    }
    
    if (i >= 10 && i < 14) {
      // Create recurring OCPP disconnect for CHG-DEL-02
      actualConnectorId = 'CHG-DEL-02';
      faults.push({
        id: `fault-${i + 1}`,
        faultType: 'OCPP network disconnect',
        timestamp,
        connectorId: actualConnectorId,
        description: getFaultDescription('OCPP network disconnect'),
        rootCause: getRootCause('OCPP network disconnect'),
        impact: getImpact(severity),
        severity,
        resolution: getResolution('OCPP network disconnect'),
        downtime: Math.round((severity === 'Critical' ? Math.random() * 12 + 8 :
                             severity === 'High' ? Math.random() * 8 + 4 : 
                             severity === 'Medium' ? Math.random() * 4 + 1 : 
                             Math.random() * 2) * 10) / 10,
        logEntry: {
          errorCode: `ERR-${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp,
          connectorId: actualConnectorId,
          rawData: '',
        },
      });
      continue;
    }

    const downtime = severity === 'Critical' ? Math.random() * 12 + 8 :
                     severity === 'High' ? Math.random() * 8 + 4 : 
                     severity === 'Medium' ? Math.random() * 4 + 1 : 
                     Math.random() * 2;

    // Add sensor data for some faults to trigger sensor-based severity scaling
    const logEntry: any = {
      errorCode: `ERR-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp,
      connectorId: actualConnectorId,
      rawData: '',
    };

    // Add sensor readings for specific fault types
    if (faultType === 'Overheating') {
      logEntry.temperature = 70 + Math.random() * 30;
    } else if (faultType === 'Overvoltage' || faultType === 'Low grid voltage') {
      logEntry.voltage = faultType === 'Overvoltage' ? 450 + Math.random() * 50 : 350 - Math.random() * 50;
    } else if (faultType === 'Overcurrent') {
      logEntry.current = 150 + Math.random() * 100;
    }

    faults.push({
      id: `fault-${i + 1}`,
      faultType,
      timestamp,
      connectorId: actualConnectorId,
      description: getFaultDescription(faultType),
      rootCause: getRootCause(faultType),
      impact: getImpact(severity),
      severity,
      resolution: getResolution(faultType),
      downtime: Math.round(downtime * 10) / 10,
      logEntry,
    });
  }

  return faults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getFaultDescription(faultType: FaultType): string {
  const descriptions: Record<FaultType, string> = {
    'Overcurrent': 'Current exceeded safe operating limits during charging session',
    'Overvoltage': 'Voltage spike detected beyond acceptable threshold',
    'Low grid voltage': 'Grid voltage dropped below minimum required level',
    'Overheating': 'Temperature sensors detected excessive heat in power module',
    'BMS communication mismatch': 'Vehicle BMS communication protocol mismatch',
    'OCPP network disconnect': 'Lost connection to OCPP backend server',
    'Power module failure': 'Internal power conversion module malfunction',
    'Vehicle-side abort': 'Charging session terminated by vehicle',
    'Emergency stop': 'Emergency stop button activated',
    'Contactor stuck': 'Main contactor failed to open/close properly',
    'Repeated soft restarts': 'Multiple automatic restart attempts detected',
  };
  return descriptions[faultType];
}

function getRootCause(faultType: FaultType): string {
  const causes: Record<FaultType, string> = {
    'Overcurrent': 'Faulty vehicle battery or damaged charging cable',
    'Overvoltage': 'Grid instability or internal voltage regulator failure',
    'Low grid voltage': 'Weak grid supply or high local demand',
    'Overheating': 'Inadequate cooling or ambient temperature too high',
    'BMS communication mismatch': 'Incompatible vehicle model or outdated firmware',
    'OCPP network disconnect': 'Network infrastructure issue or server downtime',
    'Power module failure': 'Component aging or manufacturing defect',
    'Vehicle-side abort': 'User intervention or vehicle safety system trigger',
    'Emergency stop': 'Safety protocol activation or user emergency action',
    'Contactor stuck': 'Mechanical wear or electrical arc damage',
    'Repeated soft restarts': 'Software bug or intermittent hardware fault',
  };
  return causes[faultType];
}

function getImpact(severity: SeverityLevel): string {
  if (severity === 'Critical') return 'Charger completely offline, severe safety risk, immediate action required';
  if (severity === 'High') return 'Charger offline, immediate revenue loss';
  if (severity === 'Medium') return 'Reduced charging capacity, partial revenue impact';
  return 'Minor disruption, minimal revenue impact';
}

function getResolution(faultType: FaultType): string {
  const resolutions: Record<FaultType, string> = {
    'Overcurrent': 'Inspect cable and vehicle connector. Replace if damaged. Contact electrician.',
    'Overvoltage': 'Check grid supply stability. Test voltage regulator. Vendor support required.',
    'Low grid voltage': 'Verify grid connection. Consider voltage stabilizer installation.',
    'Overheating': 'Clean cooling vents. Check ambient temperature. Improve ventilation.',
    'BMS communication mismatch': 'Update charger firmware. Check vehicle compatibility list.',
    'OCPP network disconnect': 'Verify network connection. Check backend server status.',
    'Power module failure': 'Replace power module. Contact vendor for replacement part.',
    'Vehicle-side abort': 'No action required. User-initiated or vehicle safety feature.',
    'Emergency stop': 'Reset emergency stop button. Inspect for safety hazards.',
    'Contactor stuck': 'Replace contactor assembly. Electrician required.',
    'Repeated soft restarts': 'Update firmware. If persists, contact vendor support.',
  };
  return resolutions[faultType];
}

function generateSampleSessions(): SessionData[] {
  const sessions: SessionData[] = [];
  const sites = ['Mumbai Central', 'Delhi Hub', 'Bangalore Tech Park', 'Hyderabad Station', 'Chennai Port', 'Pune Plaza', 'Kolkata Junction'];
  const now = Date.now();

  // Generate 200 sessions for better revenue data
  for (let i = 0; i < 200; i++) {
    const site = sites[Math.floor(Math.random() * sites.length)];
    const energy = Math.random() * 50 + 10;
    const duration = Math.round((energy / 7.4) * 60);
    const tariff = Math.random() * 3 + 8;
    const revenue = energy * tariff;
    const stopTime = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const startTime = new Date(stopTime.getTime() - duration * 60 * 1000);

    sessions.push({
      siteId: site,
      chargerId: connectorIds[Math.floor(Math.random() * connectorIds.length)],
      connectorId: `Connector-${Math.floor(Math.random() * 2) + 1}`,
      energy_kWh: Math.round(energy * 10) / 10,
      sessionDurationMin: duration,
      tariffINR: Math.round(tariff * 100) / 100,
      revenueINR: Math.round(revenue * 100) / 100,
      startTime: startTime.toISOString(),
      stopTime: stopTime.toISOString(),
    });
  }

  return sessions.sort((a, b) => new Date(b.stopTime).getTime() - new Date(a.stopTime).getTime());
}

function calculateSampleSiteMetrics(sessions: SessionData[]): SiteMetrics[] {
  const siteMap = new Map<string, SessionData[]>();
  
  sessions.forEach(session => {
    if (!siteMap.has(session.siteId)) {
      siteMap.set(session.siteId, []);
    }
    siteMap.get(session.siteId)!.push(session);
  });

  const metrics: SiteMetrics[] = [];
  siteMap.forEach((siteSessions, siteId) => {
    const totalEnergy = siteSessions.reduce((sum, s) => sum + s.energy_kWh, 0);
    const totalRevenue = siteSessions.reduce((sum, s) => sum + s.revenueINR, 0);
    const totalDuration = siteSessions.reduce((sum, s) => sum + s.sessionDurationMin, 0);
    const sessionCount = siteSessions.length;
    const chargers = new Set(siteSessions.map(s => s.chargerId));

    metrics.push({
      siteId,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSessions: sessionCount,
      avgSessionRevenue: Math.round((totalRevenue / sessionCount) * 100) / 100,
      avgSessionDuration: Math.round(totalDuration / sessionCount),
      utilizationPercent: Math.round(Math.random() * 30 + 50),
      sessionsPerDay: Math.round((sessionCount / 30) * 10) / 10,
      peakHour: Math.floor(Math.random() * 6) + 17,
      chargerCount: chargers.size,
      connectorCount: chargers.size * 2,
    });
  });

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function calculateSampleChargerMetrics(sessions: SessionData[]): ChargerMetrics[] {
  const chargerMap = new Map<string, SessionData[]>();
  
  sessions.forEach(session => {
    if (!chargerMap.has(session.chargerId)) {
      chargerMap.set(session.chargerId, []);
    }
    chargerMap.get(session.chargerId)!.push(session);
  });

  const metrics: ChargerMetrics[] = [];
  chargerMap.forEach((chargerSessions, chargerId) => {
    const totalEnergy = chargerSessions.reduce((sum, s) => sum + s.energy_kWh, 0);
    const totalRevenue = chargerSessions.reduce((sum, s) => sum + s.revenueINR, 0);
    const totalDuration = chargerSessions.reduce((sum, s) => sum + s.sessionDurationMin, 0);
    const sessionCount = chargerSessions.length;
    const daysActive = 30;
    const utilization = Math.round(Math.random() * 40 + 40);

    let performance: 'good' | 'low' | 'dead' | 'underutilized';
    if (utilization >= 70) performance = 'good';
    else if (utilization >= 40) performance = 'underutilized';
    else if (utilization >= 10) performance = 'low';
    else performance = 'dead';

    metrics.push({
      siteId: chargerSessions[0].siteId,
      chargerId,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSessions: sessionCount,
      avgSessionRevenue: Math.round((totalRevenue / sessionCount) * 100) / 100,
      avgSessionDuration: Math.round(totalDuration / sessionCount),
      utilizationPercent: utilization,
      sessionsPerDay: Math.round((sessionCount / daysActive) * 10) / 10,
      performance,
      connectorCount: 2,
    });
  });

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function loadSampleData(): SampleDataResult {
  const faults = generateSampleFaults();
  const sessions = generateSampleSessions();
  const siteMetrics = calculateSampleSiteMetrics(sessions);
  const chargerMetrics = calculateSampleChargerMetrics(sessions);
  const healthData = calculateHealthData(faults);

  return {
    faults,
    sessions,
    siteMetrics,
    chargerMetrics,
    healthData,
  };
}
