import { FIELD_MAPPINGS } from './vendorSignatures';
import type { NormalizedLogEntry } from '@/types/vendor.types';

export function mapFieldsToStandard(
  rawEntry: Record<string, unknown>,
  _detectedHeaders?: string[]
): Partial<NormalizedLogEntry> {
  const normalized: Partial<NormalizedLogEntry> = {
    timestamp: '',
    errorCode: '',
    connectorId: '',
    status: '',
    voltage: null,
    current: null,
    meterValue: null,
    temperature: null,
    vendorErrorString: '',
    restartCount: 0,
    rawData: rawEntry,
  };

  const availableKeys = Object.keys(rawEntry);

  for (const [standardField, mapping] of Object.entries(FIELD_MAPPINGS)) {
    let foundValue: unknown = null;

    for (const vendorField of mapping.vendorFields) {
      const matchingKey = availableKeys.find(
        key => key.toLowerCase() === vendorField.toLowerCase()
      );

      if (matchingKey && rawEntry[matchingKey] !== undefined && rawEntry[matchingKey] !== null) {
        foundValue = rawEntry[matchingKey];
        break;
      }
    }

    if (foundValue !== null) {
      if (mapping.transform && typeof foundValue === 'string') {
        normalized[standardField as keyof NormalizedLogEntry] = mapping.transform(foundValue) as never;
      } else {
        normalized[standardField as keyof NormalizedLogEntry] = foundValue as never;
      }
    }
  }

  return normalized;
}

export function buildFieldMappingReport(
  rawHeaders: string[]
): Map<string, string> {
  const mappingReport = new Map<string, string>();

  for (const header of rawHeaders) {
    const headerLower = header.toLowerCase();

    for (const [standardField, mapping] of Object.entries(FIELD_MAPPINGS)) {
      const matchingVendorField = mapping.vendorFields.find(
        vf => vf.toLowerCase() === headerLower
      );

      if (matchingVendorField) {
        mappingReport.set(header, standardField);
        break;
      }
    }

    if (!mappingReport.has(header)) {
      mappingReport.set(header, 'unmapped');
    }
  }

  return mappingReport;
}

export function extractHeadersFromCSV(csvContent: string): string[] {
  const lines = csvContent.split('\n');
  if (lines.length === 0) return [];

  const firstLine = lines[0].trim();
  return firstLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
}

export function extractKeysFromJSON(jsonContent: string): string[] {
  try {
    const parsed = JSON.parse(jsonContent);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return Object.keys(parsed[0]);
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.keys(parsed);
    }
  } catch {
    return [];
  }
  return [];
}

export function normalizeTimestamp(timestamp: string | number): string {
  if (!timestamp) return new Date().toISOString();

  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }

  const cleanedTimestamp = timestamp.trim();

  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (isoPattern.test(cleanedTimestamp)) {
    return new Date(cleanedTimestamp).toISOString();
  }

  const datePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
  if (datePattern.test(cleanedTimestamp)) {
    return new Date(cleanedTimestamp.replace(' ', 'T')).toISOString();
  }

  const unixPattern = /^\d{10,13}$/;
  if (unixPattern.test(cleanedTimestamp)) {
    const ts = parseInt(cleanedTimestamp, 10);
    return new Date(ts > 9999999999 ? ts : ts * 1000).toISOString();
  }

  try {
    return new Date(cleanedTimestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function normalizeConnectorId(connectorId: string | number): string {
  if (typeof connectorId === 'number') {
    return connectorId.toString();
  }

  const cleaned = connectorId.toString().trim();

  const numericMatch = cleaned.match(/\d+/);
  if (numericMatch) {
    return numericMatch[0];
  }

  return cleaned || '0';
}

export function normalizeErrorCode(errorCode: string | number): string {
  if (!errorCode) return 'UNKNOWN';

  const cleaned = errorCode.toString().trim().toUpperCase();

  if (cleaned.includes('OVERCURRENT')) return 'OVERCURRENT';
  if (cleaned.includes('OVERVOLTAGE')) return 'OVERVOLTAGE';
  if (cleaned.includes('UNDERVOLTAGE') || cleaned.includes('LOW_VOLTAGE')) return 'LOW_VOLTAGE';
  if (cleaned.includes('OVERHEAT') || cleaned.includes('TEMPERATURE')) return 'OVERHEATING';
  if (cleaned.includes('BMS') || cleaned.includes('COMMUNICATION')) return 'BMS_MISMATCH';
  if (cleaned.includes('OCPP') || cleaned.includes('NETWORK')) return 'OCPP_DISCONNECT';
  if (cleaned.includes('POWER') || cleaned.includes('MODULE')) return 'POWER_MODULE';
  if (cleaned.includes('EMERGENCY') || cleaned.includes('ESTOP')) return 'EMERGENCY_STOP';
  if (cleaned.includes('CONTACTOR') || cleaned.includes('RELAY')) return 'CONTACTOR_STUCK';
  if (cleaned.includes('RESTART') || cleaned.includes('REBOOT')) return 'SOFT_RESTART';
  if (cleaned.includes('VEHICLE') || cleaned.includes('EV_')) return 'VEHICLE_ABORT';

  return cleaned;
}
