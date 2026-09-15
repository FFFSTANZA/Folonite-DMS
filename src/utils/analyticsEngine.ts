import { 
  SessionData, 
  SiteMetrics, 
  ChargerMetrics, 
  ConnectorMetrics,
  AnalyticsSummary 
} from '@/types/analytics';

const MINUTES_IN_MONTH = 30 * 24 * 60; // Assuming 30-day month

export function calculateSiteMetrics(sessions: SessionData[]): SiteMetrics[] {
  const siteGroups = groupBy(sessions, 'siteId');
  const metrics: SiteMetrics[] = [];

  for (const [siteId, siteSessions] of Object.entries(siteGroups)) {
    const totalRevenue = siteSessions.reduce((sum, s) => sum + s.revenueINR, 0);
    const totalEnergy = siteSessions.reduce((sum, s) => sum + s.energy_kWh, 0);
    const totalDuration = siteSessions.reduce((sum, s) => sum + s.sessionDurationMin, 0);
    const totalSessions = siteSessions.length;

    const uniqueChargers = new Set(siteSessions.map(s => s.chargerId)).size;
    const uniqueConnectors = new Set(siteSessions.map(s => `${s.chargerId}-${s.connectorId}`)).size;

    const dateRange = getDateRange(siteSessions);
    const daysInRange = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const totalAvailableMinutes = uniqueConnectors * MINUTES_IN_MONTH;
    const utilizationPercent = (totalDuration / totalAvailableMinutes) * 100;

    const peakHour = findPeakHour(siteSessions);

    metrics.push({
      siteId,
      totalRevenue,
      totalEnergy,
      avgSessionRevenue: totalRevenue / totalSessions,
      avgSessionDuration: totalDuration / totalSessions,
      utilizationPercent: Math.min(100, utilizationPercent),
      sessionsPerDay: totalSessions / daysInRange,
      peakHour,
      totalSessions,
      chargerCount: uniqueChargers,
      connectorCount: uniqueConnectors,
    });
  }

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function calculateChargerMetrics(sessions: SessionData[]): ChargerMetrics[] {
  const chargerGroups = groupBy(sessions, (s) => `${s.siteId}|${s.chargerId}`);
  const metrics: ChargerMetrics[] = [];

  for (const [key, chargerSessions] of Object.entries(chargerGroups)) {
    const [siteId, chargerId] = key.split('|');
    
    const totalRevenue = chargerSessions.reduce((sum, s) => sum + s.revenueINR, 0);
    const totalEnergy = chargerSessions.reduce((sum, s) => sum + s.energy_kWh, 0);
    const totalDuration = chargerSessions.reduce((sum, s) => sum + s.sessionDurationMin, 0);
    const totalSessions = chargerSessions.length;

    const uniqueConnectors = new Set(chargerSessions.map(s => s.connectorId)).size;

    const dateRange = getDateRange(chargerSessions);
    const daysInRange = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const totalAvailableMinutes = uniqueConnectors * MINUTES_IN_MONTH;
    const utilizationPercent = (totalDuration / totalAvailableMinutes) * 100;
    const sessionsPerDay = totalSessions / daysInRange;

    const performance = classifyChargerPerformance(sessionsPerDay, utilizationPercent);

    metrics.push({
      siteId,
      chargerId,
      totalRevenue,
      totalEnergy,
      totalSessions,
      avgSessionRevenue: totalRevenue / totalSessions,
      avgSessionDuration: totalDuration / totalSessions,
      utilizationPercent: Math.min(100, utilizationPercent),
      sessionsPerDay,
      performance,
      connectorCount: uniqueConnectors,
    });
  }

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function calculateConnectorMetrics(sessions: SessionData[]): ConnectorMetrics[] {
  const connectorGroups = groupBy(sessions, (s) => `${s.siteId}|${s.chargerId}|${s.connectorId}`);
  const metrics: ConnectorMetrics[] = [];

  for (const [key, connectorSessions] of Object.entries(connectorGroups)) {
    const [siteId, chargerId, connectorId] = key.split('|');
    
    const totalRevenue = connectorSessions.reduce((sum, s) => sum + s.revenueINR, 0);
    const totalEnergy = connectorSessions.reduce((sum, s) => sum + s.energy_kWh, 0);
    const totalDuration = connectorSessions.reduce((sum, s) => sum + s.sessionDurationMin, 0);
    const totalSessions = connectorSessions.length;

    const utilizationPercent = (totalDuration / MINUTES_IN_MONTH) * 100;

    metrics.push({
      siteId,
      chargerId,
      connectorId,
      totalRevenue,
      totalEnergy,
      totalSessions,
      avgSessionRevenue: totalRevenue / totalSessions,
      utilizationPercent: Math.min(100, utilizationPercent),
    });
  }

  return metrics;
}

export function calculateAnalyticsSummary(
  sessions: SessionData[],
  siteMetrics: SiteMetrics[],
  chargerMetrics: ChargerMetrics[]
): AnalyticsSummary {
  const totalRevenue = sessions.reduce((sum, s) => sum + s.revenueINR, 0);
  const totalEnergy = sessions.reduce((sum, s) => sum + s.energy_kWh, 0);
  const totalSessions = sessions.length;

  const avgUtilization = chargerMetrics.reduce((sum, c) => sum + c.utilizationPercent, 0) / chargerMetrics.length;
  const deadChargers = chargerMetrics.filter(c => c.performance === 'dead').length;
  const underutilizedChargers = chargerMetrics.filter(c => c.performance === 'underutilized').length;

  const dateRange = getDateRange(sessions);

  return {
    totalSites: siteMetrics.length,
    totalChargers: chargerMetrics.length,
    totalRevenue,
    totalEnergy,
    totalSessions,
    avgUtilization: avgUtilization || 0,
    deadChargers,
    underutilizedChargers,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
}

function classifyChargerPerformance(
  sessionsPerDay: number,
  utilizationPercent: number
): 'good' | 'low' | 'dead' | 'underutilized' {
  if (sessionsPerDay <= 1) {
    return 'dead';
  }
  if (utilizationPercent < 10) {
    return 'underutilized';
  }
  if (sessionsPerDay >= 5 && utilizationPercent >= 30) {
    return 'good';
  }
  return 'low';
}

function findPeakHour(sessions: SessionData[]): number {
  const hourCounts: Record<number, number> = {};

  for (const session of sessions) {
    try {
      const date = new Date(session.startTime);
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    } catch (error) {
      // Skip invalid dates
    }
  }

  let peakHour = 0;
  let maxCount = 0;

  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }

  return peakHour;
}

function getDateRange(sessions: SessionData[]): { start: Date; end: Date } {
  let start = new Date();
  let end = new Date(0);

  for (const session of sessions) {
    try {
      const startDate = new Date(session.startTime);
      const stopDate = new Date(session.stopTime);

      if (startDate < start) start = startDate;
      if (stopDate > end) end = stopDate;
    } catch (error) {
      // Skip invalid dates
    }
  }

  return { start, end };
}

function groupBy<T>(
  array: T[],
  keyOrFn: keyof T | ((item: T) => string)
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of array) {
    const key = typeof keyOrFn === 'function' ? keyOrFn(item) : String(item[keyOrFn]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  return groups;
}
