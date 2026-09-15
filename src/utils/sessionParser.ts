import { SessionData } from '@/types/analytics';

export async function parseSessionCSV(file: File): Promise<SessionData[]> {
  const text = await file.text();
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const sessions: SessionData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    try {
      const session: SessionData = {
        siteId: row.siteid || row.site_id || '',
        chargerId: row.chargerid || row.charger_id || '',
        connectorId: row.connectorid || row.connector_id || '',
        energy_kWh: parseFloat(row.energy_kwh || row.energy || '0'),
        sessionDurationMin: parseFloat(row.sessiondurationmin || row.session_duration_min || row.duration || '0'),
        tariffINR: parseFloat(row.tariffinr || row.tariff_inr || row.tariff || '0'),
        revenueINR: parseFloat(row.revenueinr || row.revenue_inr || row.revenue || '0'),
        startTime: row.starttime || row.start_time || '',
        stopTime: row.stoptime || row.stop_time || '',
      };

      if (session.siteId && session.chargerId && session.connectorId) {
        sessions.push(session);
      }
    } catch (error) {
      console.warn(`Skipping invalid row ${i}:`, error);
    }
  }

  if (sessions.length === 0) {
    throw new Error('No valid session data found in CSV');
  }

  return sessions;
}

export async function parseSessionJSON(file: File): Promise<SessionData[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  const sessions: SessionData[] = [];
  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    try {
      const session: SessionData = {
        siteId: item.siteId || item.site_id || '',
        chargerId: item.chargerId || item.charger_id || '',
        connectorId: item.connectorId || item.connector_id || '',
        energy_kWh: parseFloat(item.energy_kWh || item.energy || '0'),
        sessionDurationMin: parseFloat(item.sessionDurationMin || item.session_duration_min || item.duration || '0'),
        tariffINR: parseFloat(item.tariffINR || item.tariff_inr || item.tariff || '0'),
        revenueINR: parseFloat(item.revenueINR || item.revenue_inr || item.revenue || '0'),
        startTime: item.startTime || item.start_time || '',
        stopTime: item.stopTime || item.stop_time || '',
      };

      if (session.siteId && session.chargerId && session.connectorId) {
        sessions.push(session);
      }
    } catch (error) {
      console.warn('Skipping invalid item:', error);
    }
  }

  if (sessions.length === 0) {
    throw new Error('No valid session data found in JSON');
  }

  return sessions;
}

export async function parseSessionFile(file: File): Promise<SessionData[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseSessionCSV(file);
    case 'json':
      return parseSessionJSON(file);
    default:
      throw new Error('Unsupported file format. Please upload CSV or JSON.');
  }
}
