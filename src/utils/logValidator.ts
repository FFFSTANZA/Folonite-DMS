import type { NormalizedLogEntry, ValidationResult } from '@/types/vendor.types';
import { normalizeTimestamp, normalizeConnectorId, normalizeErrorCode } from './fieldMapper';

export function validateAndFixLogEntry(
  entry: Partial<NormalizedLogEntry>
): { entry: NormalizedLogEntry; fixed: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let fixed = false;

  if (!entry.timestamp || entry.timestamp === '') {
    entry.timestamp = new Date().toISOString();
    warnings.push('Missing timestamp - set to current time');
    fixed = true;
  } else {
    try {
      const normalized = normalizeTimestamp(entry.timestamp);
      if (normalized !== entry.timestamp) {
        entry.timestamp = normalized;
        fixed = true;
      }
    } catch {
      entry.timestamp = new Date().toISOString();
      warnings.push('Invalid timestamp format - fixed to current time');
      fixed = true;
    }
  }

  if (!entry.connectorId || entry.connectorId === '') {
    entry.connectorId = '0';
    warnings.push('Missing connector ID - set to 0');
    fixed = true;
  } else {
    const normalized = normalizeConnectorId(entry.connectorId);
    if (normalized !== entry.connectorId) {
      entry.connectorId = normalized;
      fixed = true;
    }
  }

  if (!entry.errorCode || entry.errorCode === '') {
    entry.errorCode = 'UNKNOWN';
    warnings.push('Missing error code - set to UNKNOWN');
    fixed = true;
  } else {
    const normalized = normalizeErrorCode(entry.errorCode);
    if (normalized !== entry.errorCode) {
      entry.errorCode = normalized;
      fixed = true;
    }
  }

  if (!entry.status || entry.status === '') {
    entry.status = 'Unknown';
    fixed = true;
  }

  if (entry.voltage !== null && entry.voltage !== undefined) {
    if (typeof entry.voltage === 'string') {
      entry.voltage = parseFloat(entry.voltage) || null;
      fixed = true;
    }
    if (entry.voltage !== null && (entry.voltage < 0 || entry.voltage > 1000)) {
      warnings.push(`Invalid voltage value: ${entry.voltage}V`);
    }
  }

  if (entry.current !== null && entry.current !== undefined) {
    if (typeof entry.current === 'string') {
      entry.current = parseFloat(entry.current) || null;
      fixed = true;
    }
    if (entry.current !== null && (entry.current < 0 || entry.current > 500)) {
      warnings.push(`Invalid current value: ${entry.current}A`);
    }
  }

  if (entry.temperature !== null && entry.temperature !== undefined) {
    if (typeof entry.temperature === 'string') {
      entry.temperature = parseFloat(entry.temperature) || null;
      fixed = true;
    }
    if (entry.temperature !== null && (entry.temperature < -50 || entry.temperature > 150)) {
      warnings.push(`Invalid temperature value: ${entry.temperature}°C`);
    }
  }

  if (entry.meterValue !== null && entry.meterValue !== undefined) {
    if (typeof entry.meterValue === 'string') {
      entry.meterValue = parseFloat(entry.meterValue) || null;
      fixed = true;
    }
    if (entry.meterValue !== null && entry.meterValue < 0) {
      warnings.push(`Invalid meter value: ${entry.meterValue}`);
    }
  }

  if (!entry.vendorErrorString || entry.vendorErrorString === '') {
    entry.vendorErrorString = '';
  }

  if (entry.restartCount === undefined || entry.restartCount === null) {
    entry.restartCount = 0;
  } else if (typeof entry.restartCount === 'string') {
    entry.restartCount = parseInt(entry.restartCount, 10) || 0;
    fixed = true;
  }

  return {
    entry: entry as NormalizedLogEntry,
    fixed,
    warnings,
  };
}

export function validateLogBatch(
  entries: Partial<NormalizedLogEntry>[]
): ValidationResult {
  let fixedCount = 0;
  const allWarnings: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { fixed, warnings } = validateAndFixLogEntry(entries[i]);
    
    if (fixed) {
      fixedCount++;
    }

    if (warnings.length > 0) {
      allWarnings.push(`Line ${i + 1}: ${warnings.join(', ')}`);
    }
  }

  const uniqueWarnings = [...new Set(allWarnings)];

  return {
    isValid: errors.length === 0,
    fixedCount,
    warnings: uniqueWarnings.slice(0, 10),
    errors,
  };
}

export function detectCorruptedLines(content: string): number {
  const lines = content.split('\n');
  let corruptedCount = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      corruptedCount++;
      continue;
    }

    if (line.length < 10) {
      corruptedCount++;
      continue;
    }

    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      corruptedCount++;
      continue;
    }

    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      corruptedCount++;
      continue;
    }
  }

  return corruptedCount;
}

export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp) return false;

  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

export function isValidConnectorId(connectorId: string | number): boolean {
  if (connectorId === undefined || connectorId === null) return false;

  const id = connectorId.toString();
  const numericId = parseInt(id, 10);

  return !isNaN(numericId) && numericId >= 0 && numericId <= 100;
}
