import type { FaultAnalysis, FaultType, SeverityLevel, LogEntry } from '@/types/fault';
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

// ─── Realistic Indian EV charging network ─────────────────────────────────────

interface ChargerInfo {
  id: string;
  siteId: string;
  vendor: string;
  maxPowerKW: number;
  connectorCount: number;
  healthProfile: 'healthy' | 'degrading' | 'unhealthy';
}

const SITES = [
  { id: 'Mumbai-Central', city: 'Mumbai', chargerCount: 3 },
  { id: 'Delhi-Hub', city: 'Delhi', chargerCount: 2 },
  { id: 'Bangalore-TechPark', city: 'Bangalore', chargerCount: 2 },
  { id: 'Hyderabad-Station', city: 'Hyderabad', chargerCount: 2 },
  { id: 'Chennai-Port', city: 'Chennai', chargerCount: 1 },
  { id: 'Pune-Plaza', city: 'Pune', chargerCount: 2 },
  { id: 'Kolkata-Junction', city: 'Kolkata', chargerCount: 1 },
];

const CHARGERS: ChargerInfo[] = [
  // Mumbai Central - 3 chargers (one degrading)
  { id: 'CHG-MUM-01', siteId: 'Mumbai-Central', vendor: 'Delta', maxPowerKW: 60, connectorCount: 2, healthProfile: 'degrading' },
  { id: 'CHG-MUM-02', siteId: 'Mumbai-Central', vendor: 'ABB', maxPowerKW: 120, connectorCount: 2, healthProfile: 'healthy' },
  { id: 'CHG-MUM-03', siteId: 'Mumbai-Central', vendor: 'Exicom', maxPowerKW: 30, connectorCount: 1, healthProfile: 'healthy' },
  // Delhi Hub - 2 chargers
  { id: 'CHG-DEL-01', siteId: 'Delhi-Hub', vendor: 'Tata Power', maxPowerKW: 60, connectorCount: 2, healthProfile: 'healthy' },
  { id: 'CHG-DEL-02', siteId: 'Delhi-Hub', vendor: 'Servotech', maxPowerKW: 30, connectorCount: 2, healthProfile: 'unhealthy' },
  // Bangalore Tech Park - 2 chargers
  { id: 'CHG-BLR-01', siteId: 'Bangalore-TechPark', vendor: 'Delta', maxPowerKW: 60, connectorCount: 2, healthProfile: 'healthy' },
  { id: 'CHG-BLR-02', siteId: 'Bangalore-TechPark', vendor: 'ABB', maxPowerKW: 120, connectorCount: 2, healthProfile: 'healthy' },
  // Hyderabad Station - 2 chargers (one degrading)
  { id: 'CHG-HYD-01', siteId: 'Hyderabad-Station', vendor: 'Charge+Zone', maxPowerKW: 60, connectorCount: 2, healthProfile: 'degrading' },
  { id: 'CHG-HYD-02', siteId: 'Hyderabad-Station', vendor: 'Exicom', maxPowerKW: 30, connectorCount: 1, healthProfile: 'healthy' },
  // Chennai Port - 1 charger
  { id: 'CHG-CHN-01', siteId: 'Chennai-Port', vendor: 'Fortum', maxPowerKW: 60, connectorCount: 2, healthProfile: 'healthy' },
  // Pune Plaza - 2 chargers
  { id: 'CHG-PUN-01', siteId: 'Pune-Plaza', vendor: 'Tata Power', maxPowerKW: 60, connectorCount: 2, healthProfile: 'healthy' },
  { id: 'CHG-PUN-02', siteId: 'Pune-Plaza', vendor: 'Servotech', maxPowerKW: 30, connectorCount: 1, healthProfile: 'healthy' },
  // Kolkata Junction - 1 charger
  { id: 'CHG-KOL-01', siteId: 'Kolkata-Junction', vendor: 'Statiq', maxPowerKW: 30, connectorCount: 2, healthProfile: 'healthy' },
];

// ─── Fault generation ────────────────────────────────────────────────────────

// Fault type weights (some faults are more common than others)
const FAULT_WEIGHTS: { type: FaultType; weight: number }[] = [
  { type: 'OCPP network disconnect', weight: 20 },
  { type: 'Overheating', weight: 15 },
  { type: 'Overcurrent', weight: 12 },
  { type: 'Vehicle-side abort', weight: 12 },
  { type: 'Low grid voltage', weight: 10 },
  { type: 'Overvoltage', weight: 8 },
  { type: 'Repeated soft restarts', weight: 7 },
  { type: 'BMS communication mismatch', weight: 6 },
  { type: 'Power module failure', weight: 4 },
  { type: 'Contactor stuck', weight: 3 },
  { type: 'Emergency stop', weight: 3 },
];

function pickWeightedFaultType(): FaultType {
  const totalWeight = FAULT_WEIGHTS.reduce((sum, f) => sum + f.weight, 0);
  let random = Math.random() * totalWeight;
  for (const fw of FAULT_WEIGHTS) {
    random -= fw.weight;
    if (random <= 0) return fw.type;
  }
  return FAULT_WEIGHTS[0].type;
}

function pickSeverity(healthProfile: string): SeverityLevel {
  const roll = Math.random();
  if (healthProfile === 'unhealthy') {
    if (roll < 0.15) return 'Critical';
    if (roll < 0.45) return 'High';
    if (roll < 0.75) return 'Medium';
    return 'Low';
  }
  if (healthProfile === 'degrading') {
    if (roll < 0.05) return 'Critical';
    if (roll < 0.20) return 'High';
    if (roll < 0.55) return 'Medium';
    return 'Low';
  }
  // healthy
  if (roll < 0.02) return 'Critical';
  if (roll < 0.10) return 'High';
  if (roll < 0.35) return 'Medium';
  return 'Low';
}

function getDowntimeHours(severity: SeverityLevel, faultType: FaultType): number {
  const base: Record<SeverityLevel, number> = {
    Critical: 8,
    High: 4,
    Medium: 2,
    Low: 0.5,
  };
  const multiplier = faultType === 'Power module failure' ? 2.5
    : faultType === 'Contactor stuck' ? 2
    : faultType === 'Emergency stop' ? 0.5
    : 1;
  return Math.round((base[severity] * multiplier * (0.7 + Math.random() * 0.6)) * 10) / 10;
}

function generateTimestamp(daysBack: number): string {
  const now = Date.now();
  const start = now - daysBack * 24 * 60 * 60 * 1000;
  // Bias towards business hours (8 AM - 10 PM IST)
  const hour = Math.floor(Math.random() * 14) + 8; // 8-21
  const minute = Math.floor(Math.random() * 60);
  const ts = new Date(start);
  ts.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
  return ts.toISOString();
}

function getSensorReadings(faultType: FaultType, severity: SeverityLevel): Partial<LogEntry> {
  const entry: Partial<LogEntry> = {};
  switch (faultType) {
    case 'Overheating':
      entry.temperature = severity === 'Critical' ? 85 + Math.random() * 15
        : severity === 'High' ? 75 + Math.random() * 10
        : 65 + Math.random() * 10;
      entry.voltage = 370 + Math.random() * 30;
      entry.current = 40 + Math.random() * 40;
      break;
    case 'Overvoltage':
      entry.voltage = 480 + Math.random() * 40;
      entry.current = 30 + Math.random() * 30;
      entry.temperature = 40 + Math.random() * 15;
      break;
    case 'Low grid voltage':
      entry.voltage = 160 + Math.random() * 40;
      entry.current = 15 + Math.random() * 20;
      entry.temperature = 35 + Math.random() * 10;
      break;
    case 'Overcurrent':
      entry.current = 90 + Math.random() * 60;
      entry.voltage = 370 + Math.random() * 30;
      entry.temperature = 55 + Math.random() * 20;
      break;
    case 'Power module failure':
      entry.voltage = 0;
      entry.current = 0;
      entry.temperature = 50 + Math.random() * 30;
      break;
    case 'Contactor stuck':
      entry.voltage = 380 + Math.random() * 20;
      entry.current = 0;
      entry.temperature = 45 + Math.random() * 15;
      break;
    default:
      entry.voltage = 370 + Math.random() * 30;
      entry.current = 30 + Math.random() * 50;
      entry.temperature = 35 + Math.random() * 25;
  }
  return entry;
}

function getErrorCode(faultType: FaultType): string {
  const codes: Record<FaultType, string[]> = {
    'Overcurrent': ['OC_001', 'OC_002', 'OC_003'],
    'Overvoltage': ['OV_001', 'OV_002'],
    'Low grid voltage': ['LV_001', 'LV_002', 'LV_003'],
    'Overheating': ['TEMP_001', 'TEMP_002', 'TEMP_003'],
    'BMS communication mismatch': ['BMS_001', 'BMS_002'],
    'OCPP network disconnect': ['NET_001', 'NET_002', 'NET_003'],
    'Power module failure': ['PWR_001', 'PWR_002'],
    'Vehicle-side abort': ['EV_001', 'EV_002'],
    'Emergency stop': ['ESTOP_001'],
    'Contactor stuck': ['CT_001', 'CT_002'],
    'Repeated soft restarts': ['RST_001', 'RST_002'],
  };
  const codesForType = codes[faultType];
  return codesForType[Math.floor(Math.random() * codesForType.length)];
}

function generateSampleFaults(): FaultAnalysis[] {
  const faults: FaultAnalysis[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let idCounter = 1;

  // ── Recurring fault pattern 1: CHG-MUM-01 overheating (degrading charger) ──
  // 8 overheating events over 10 days, escalating severity
  const mum01Pattern: SeverityLevel[] = ['Low', 'Low', 'Medium', 'Medium', 'High', 'High', 'High', 'Critical'];
  for (let i = 0; i < mum01Pattern.length; i++) {
    const severity = mum01Pattern[i];
    const daysBack = 10 - i;
    const timestamp = generateTimestamp(daysBack);
    const temp = severity === 'Critical' ? 88 + Math.random() * 8
      : severity === 'High' ? 80 + Math.random() * 8
      : 72 + Math.random() * 8;
    faults.push({
      id: `fault-${idCounter++}`,
      faultType: 'Overheating',
      timestamp,
      connectorId: 'CHG-MUM-01',
      description: 'Temperature sensors detected excessive heat in power module',
      rootCause: 'Cooling fan bearing wear causing gradual degradation of thermal management',
      impact: severity === 'Critical' ? 'Charger completely offline, severe safety risk'
        : severity === 'High' ? 'Charger offline, immediate revenue loss'
        : 'Reduced charging capacity during peak hours',
      severity,
      resolution: 'Replace cooling fan assembly. Clean air filters. Improve ventilation clearance.',
      downtime: getDowntimeHours(severity, 'Overheating'),
      logEntry: {
        errorCode: 'TEMP_001',
        timestamp,
        connectorId: 'CHG-MUM-01',
        rawData: `2025-12-${String(14 - i).padStart(2, '0')} ${8 + i}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00 [FAULT] Overheating detected - temp ${Math.round(temp)}C`,
        temperature: Math.round(temp * 10) / 10,
        voltage: 380,
        current: 75 - i * 3,
      },
    });
  }

  // ── Recurring fault pattern 2: CHG-DEL-02 OCPP disconnects (unhealthy charger) ──
  // 10 OCPP disconnects over 5 days
  for (let i = 0; i < 10; i++) {
    const daysBack = 5 - Math.floor(i / 2);
    const timestamp = generateTimestamp(daysBack);
    const severity: SeverityLevel = i >= 8 ? 'High' : i >= 5 ? 'Medium' : 'Low';
    faults.push({
      id: `fault-${idCounter++}`,
      faultType: 'OCPP network disconnect',
      timestamp,
      connectorId: 'CHG-DEL-02',
      description: 'Lost connection to OCPP backend server',
      rootCause: i < 4 ? 'WiFi signal weak - router placement suboptimal'
        : i < 7 ? 'Intermittent ISP outage in commercial area'
        : 'Network card degradation requiring hardware replacement',
      impact: severity === 'High' ? 'Charger offline, unable to authorize sessions'
        : 'Charger operates in offline mode, limited functionality',
      severity,
      resolution: 'Check network equipment. Consider 4G failover. Escalate to vendor if hardware issue.',
      downtime: getDowntimeHours(severity, 'OCPP network disconnect'),
      logEntry: {
        errorCode: 'NET_001',
        timestamp,
        connectorId: 'CHG-DEL-02',
        rawData: `2025-12-${String(14 - daysBack).padStart(2, '0')} ${9 + i}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00 [WARN] OCPP connection lost - reconnecting...`,
        voltage: 390,
        current: 55,
        temperature: 42,
      },
    });
  }

  // ── Recurring fault pattern 3: CHG-HYD-01 voltage issues (degrading) ──
  // Mix of overvoltage and low grid voltage
  const hyd01Faults: { type: FaultType; severity: SeverityLevel }[] = [
    { type: 'Low grid voltage', severity: 'Low' },
    { type: 'Low grid voltage', severity: 'Medium' },
    { type: 'Overvoltage', severity: 'Medium' },
    { type: 'Low grid voltage', severity: 'High' },
    { type: 'Overvoltage', severity: 'High' },
    { type: 'Overvoltage', severity: 'Critical' },
  ];
  for (let i = 0; i < hyd01Faults.length; i++) {
    const { type, severity } = hyd01Faults[i];
    const daysBack = 12 - i * 2;
    const timestamp = generateTimestamp(daysBack);
    const voltage = type === 'Overvoltage' ? 490 + Math.random() * 30 : 170 + Math.random() * 30;
    faults.push({
      id: `fault-${idCounter++}`,
      faultType: type,
      timestamp,
      connectorId: 'CHG-HYD-01',
      description: type === 'Overvoltage'
        ? 'Voltage spike detected beyond acceptable threshold'
        : 'Grid voltage dropped below minimum required level',
      rootCause: type === 'Overvoltage'
        ? 'Grid instability near industrial area causing voltage surges'
        : 'Weak grid supply during peak demand hours',
      impact: severity === 'Critical' ? 'Charger emergency shutdown to protect electronics'
        : severity === 'High' ? 'Charger offline, immediate revenue loss'
        : 'Charging paused temporarily until voltage stabilizes',
      severity,
      resolution: type === 'Overvoltage'
        ? 'Install voltage stabilizer. Contact utility provider about grid quality.'
        : 'Consider voltage stabilizer. Monitor grid patterns during peak hours.',
      downtime: getDowntimeHours(severity, type),
      logEntry: {
        errorCode: type === 'Overvoltage' ? 'OV_001' : 'LV_001',
        timestamp,
        connectorId: 'CHG-HYD-01',
        rawData: `Voltage ${type === 'Overvoltage' ? 'spike' : 'drop'}: ${Math.round(voltage)}V`,
        voltage: Math.round(voltage),
        current: 40 + Math.random() * 30,
        temperature: 40 + Math.random() * 10,
      },
    });
  }

  // ── Recurring fault pattern 4: CHG-BLR-02 restart loops ──
  for (let i = 0; i < 7; i++) {
    const daysBack = 6 - i;
    const timestamp = generateTimestamp(daysBack);
    const severity: SeverityLevel = i >= 5 ? 'High' : 'Medium';
    faults.push({
      id: `fault-${idCounter++}`,
      faultType: 'Repeated soft restarts',
      timestamp,
      connectorId: 'CHG-BLR-02',
      description: 'Multiple automatic restart attempts detected',
      rootCause: i < 3 ? 'Software bug in firmware v2.3.1 causing watchdog resets'
        : 'Intermittent power supply fault triggering safety restarts',
      impact: severity === 'High' ? 'Charger unreliable, frequent service interruptions'
        : 'Brief interruptions during restart cycles',
      severity,
      resolution: 'Update firmware to v2.4.0. If persists, inspect power supply board.',
      downtime: getDowntimeHours(severity, 'Repeated soft restarts'),
      logEntry: {
        errorCode: 'RST_001',
        timestamp,
        connectorId: 'CHG-BLR-02',
        rawData: `Watchdog reset #${i + 1} - system rebooting`,
        voltage: 385,
        current: 0,
        temperature: 42,
      },
    });
  }

  // ── Random faults across the network ──
  const remainingFaults = 65;
  for (let i = 0; i < remainingFaults; i++) {
    const charger = CHARGERS[Math.floor(Math.random() * CHARGERS.length)];
    const faultType = pickWeightedFaultType();
    const severity = pickSeverity(charger.healthProfile);
    const daysBack = Math.floor(Math.random() * 14);
    const timestamp = generateTimestamp(daysBack);
    const sensorData = getSensorReadings(faultType, severity);

    // Ensure some faults are from today
    let finalTimestamp = timestamp;
    if (i < 6) {
      const todayTime = today.getTime() + Math.random() * 12 * 60 * 60 * 1000;
      finalTimestamp = new Date(todayTime).toISOString();
    }

    faults.push({
      id: `fault-${idCounter++}`,
      faultType,
      timestamp: finalTimestamp,
      connectorId: charger.id,
      description: getFaultDescription(faultType),
      rootCause: getRootCause(faultType, charger.vendor),
      impact: getImpact(severity),
      severity,
      resolution: getResolution(faultType),
      downtime: getDowntimeHours(severity, faultType),
      logEntry: {
        errorCode: getErrorCode(faultType),
        timestamp: finalTimestamp,
        connectorId: charger.id,
        rawData: `${faultType} detected at ${charger.id}`,
        ...sensorData,
      },
    });
  }

  return faults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ─── Session generation ──────────────────────────────────────────────────────

function generateSampleSessions(): SessionData[] {
  const sessions: SessionData[] = [];
  let idCounter = 1;

  // Generate 30 days of sessions
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    // Each charger gets 2-8 sessions per day depending on site popularity
    for (const charger of CHARGERS) {
      const site = SITES.find(s => s.id === charger.siteId);
      const baseSessions = site?.city === 'Mumbai' ? 6
        : site?.city === 'Delhi' ? 5
        : site?.city === 'Bangalore' ? 5
        : site?.city === 'Pune' ? 4
        : site?.city === 'Hyderabad' ? 3
        : 2;

      const sessionsToday = Math.max(0, baseSessions + Math.floor(Math.random() * 3) - 1);

      for (let s = 0; s < sessionsToday; s++) {
        // Realistic time distribution: peak hours 9-11 AM, 5-8 PM
        const hourWeights = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.04, 0.08, 0.10, 0.09, 0.07, 0.05, 0.04, 0.05, 0.06, 0.08, 0.10, 0.09, 0.06, 0.04, 0.02, 0.01, 0.01];
        let hour = 0;
        let r = Math.random();
        for (let h = 0; h < 24; h++) {
          r -= hourWeights[h];
          if (r <= 0) { hour = h; break; }
        }
        const minute = Math.floor(Math.random() * 60);

        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);

        // Energy depends on charger power and session duration
        const maxEnergy = charger.maxPowerKW * 0.8; // 80% of max capacity
        const sessionMinutes = 20 + Math.floor(Math.random() * 80); // 20-100 min
        const energy = Math.min(maxEnergy, (charger.maxPowerKW * sessionMinutes / 60) * (0.5 + Math.random() * 0.5));

        const tariff = 8 + Math.random() * 7; // 8-15 INR/kWh
        const revenue = energy * tariff;
        const stopTime = new Date(startTime.getTime() + sessionMinutes * 60 * 1000);

        // Some sessions might be failed/aborted
        if (charger.healthProfile === 'unhealthy' && Math.random() < 0.15) {
          // Skip this session (failed)
          continue;
        }

        sessions.push({
          siteId: charger.siteId,
          chargerId: charger.id,
          connectorId: `Conn-${(s % charger.connectorCount) + 1}`,
          energy_kWh: Math.round(energy * 10) / 10,
          sessionDurationMin: sessionMinutes,
          tariffINR: Math.round(tariff * 100) / 100,
          revenueINR: Math.round(revenue * 100) / 100,
          startTime: startTime.toISOString(),
          stopTime: stopTime.toISOString(),
        });
        idCounter++;
      }
    }
  }

  return sessions.sort((a, b) => new Date(b.stopTime).getTime() - new Date(a.stopTime).getTime());
}

// ─── Metric calculation ──────────────────────────────────────────────────────

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
    const connectors = new Set(siteSessions.map(s => `${s.chargerId}-${s.connectorId}`));

    // Calculate actual utilization from session data
    const totalAvailableMinutes = connectors.size * 30 * 24 * 60; // 30 days
    const utilizationPercent = Math.min(100, (totalDuration / totalAvailableMinutes) * 100);

    // Find peak hour from actual data
    const hourCounts: Record<number, number> = {};
    siteSessions.forEach(s => {
      const h = new Date(s.startTime).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 17;

    metrics.push({
      siteId,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSessions: sessionCount,
      avgSessionRevenue: Math.round((totalRevenue / sessionCount) * 100) / 100,
      avgSessionDuration: Math.round(totalDuration / sessionCount),
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      sessionsPerDay: Math.round((sessionCount / 30) * 10) / 10,
      peakHour: Number(peakHour),
      chargerCount: chargers.size,
      connectorCount: connectors.size,
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

    const charger = CHARGERS.find(c => c.id === chargerId);
    const connectorCount = charger?.connectorCount ?? 2;
    const totalAvailableMinutes = connectorCount * 30 * 24 * 60;
    const utilizationPercent = Math.min(100, (totalDuration / totalAvailableMinutes) * 100);
    const sessionsPerDay = sessionCount / 30;

    let performance: 'good' | 'low' | 'dead' | 'underutilized';
    if (charger?.healthProfile === 'unhealthy') {
      performance = sessionsPerDay <= 1 ? 'dead' : 'low';
    } else if (sessionsPerDay >= 4 && utilizationPercent >= 25) {
      performance = 'good';
    } else if (utilizationPercent < 10) {
      performance = 'underutilized';
    } else {
      performance = 'low';
    }

    metrics.push({
      siteId: chargerSessions[0].siteId,
      chargerId,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSessions: sessionCount,
      avgSessionRevenue: Math.round((totalRevenue / sessionCount) * 100) / 100,
      avgSessionDuration: Math.round(totalDuration / sessionCount),
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      sessionsPerDay: Math.round(sessionsPerDay * 10) / 10,
      performance,
      connectorCount,
    });
  });

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ─── Descriptions ────────────────────────────────────────────────────────────

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

function getRootCause(faultType: FaultType, vendor: string): string {
  const causes: Record<FaultType, string[]> = {
    'Overcurrent': [
      'Vehicle battery management system requesting excessive current',
      'Faulty current sensor providing incorrect readings',
      'Damaged charging cable causing resistance heating',
    ],
    'Overvoltage': [
      'Grid voltage fluctuation outside 180-520V range',
      'Internal voltage regulator malfunction',
      `Voltage surge from adjacent industrial load (affects ${vendor} units)`,
    ],
    'Low grid voltage': [
      'Weak grid supply during peak demand hours',
      'Transformer overloading in commercial district',
      'Utility grid load shedding during summer peak',
    ],
    'Overheating': [
      'Cooling fan bearing wear causing reduced airflow',
      'Blocked ventilation due to dust accumulation',
      'Ambient temperature exceeding 42°C design limit',
    ],
    'BMS communication mismatch': [
      'Incompatible vehicle model with current firmware',
      'Damaged CCS2 connector pins causing communication errors',
      'Vehicle BMS firmware version not supported',
    ],
    'OCPP network disconnect': [
      'WiFi signal weak - router placement suboptimal',
      'ISP outage affecting commercial area',
      'Backend server maintenance window exceeded',
    ],
    'Power module failure': [
      'AC-DC converter electrolytic capacitor aging',
      'Power transistor failure from voltage spike',
      `Manufacturing defect in ${vendor} power module batch`,
    ],
    'Vehicle-side abort': [
      'User manually stopped charging due to time constraint',
      'Vehicle reached target state of charge',
      'Vehicle BMS safety threshold triggered',
    ],
    'Emergency stop': [
      'Maintenance crew activated during routine inspection',
      'Safety protocol triggered by smoke detection',
      'Accidental activation by operator',
    ],
    'Contactor stuck': [
      'Mechanical wear from repeated high-current switching',
      'Contact welding from arc damage during load break',
      'Contactor coil degradation from thermal cycling',
    ],
    'Repeated soft restarts': [
      'Watchdog timer triggered by firmware bug',
      'Intermittent hardware fault causing system instability',
      'Power supply ripple causing reset circuits to trigger',
    ],
  };
  const options = causes[faultType];
  return options[Math.floor(Math.random() * options.length)];
}

function getImpact(severity: SeverityLevel): string {
  if (severity === 'Critical') return 'Charger completely offline, severe safety risk, immediate action required';
  if (severity === 'High') return 'Charger offline, immediate revenue loss';
  if (severity === 'Medium') return 'Reduced charging capacity, partial revenue impact';
  return 'Minor disruption, minimal revenue impact';
}

function getResolution(faultType: FaultType): string {
  const resolutions: Record<FaultType, string> = {
    'Overcurrent': 'Inspect cable and vehicle connector. Replace if damaged. Calibrate current sensor.',
    'Overvoltage': 'Install surge protection. Test voltage regulator. Contact utility provider.',
    'Low grid voltage': 'Install voltage stabilizer. Consider dedicated transformer for high-demand sites.',
    'Overheating': 'Clean cooling vents and filters. Check ambient temperature. Improve ventilation clearance.',
    'BMS communication mismatch': 'Update charger firmware. Test with compatible vehicle models. Check connector pins.',
    'OCPP network disconnect': 'Check router/modem. Install 4G failover. Verify backend server status.',
    'Power module failure': 'Replace power module. Contact vendor for warranty replacement. Inspect related components.',
    'Vehicle-side abort': 'No action required. Normal user behavior or vehicle safety feature.',
    'Emergency stop': 'Reset emergency stop. Inspect site for safety hazards. Document incident.',
    'Contactor stuck': 'Replace contactor assembly. Electrician required. Inspect arc suppression.',
    'Repeated soft restarts': 'Update firmware to latest version. Monitor power supply stability.',
  };
  return resolutions[faultType];
}

// ─── Export ──────────────────────────────────────────────────────────────────

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
