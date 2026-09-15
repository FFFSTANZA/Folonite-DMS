import type { NormalizedLogEntry, DetectionResult, VendorDetectionBanner } from '@/types/vendor.types';
import { detectVendorAndFormat } from './vendorDetection';
import { mapFieldsToStandard } from './fieldMapper';
import { validateAndFixLogEntry, validateLogBatch, detectCorruptedLines } from './logValidator';

export interface NormalizationResult {
  entries: NormalizedLogEntry[];
  detection: DetectionResult;
  banner: VendorDetectionBanner;
  validationSummary: {
    totalEntries: number;
    validEntries: number;
    fixedEntries: number;
    corruptedLines: number;
    warnings: string[];
  };
}

export async function normalizeLogFile(
  content: string,
  filename: string
): Promise<NormalizationResult> {
  const detection = detectVendorAndFormat(content, filename);

  const rawEntries = parseLogContent(content, detection.format);

  const partialEntries = rawEntries.map(raw => mapFieldsToStandard(raw));

  const normalizedEntries: NormalizedLogEntry[] = [];
  let fixedCount = 0;
  const allWarnings: string[] = [];

  for (const partial of partialEntries) {
    const { entry, fixed, warnings } = validateAndFixLogEntry(partial);
    normalizedEntries.push(entry);

    if (fixed) {
      fixedCount++;
    }

    if (warnings.length > 0) {
      allWarnings.push(...warnings);
    }
  }

  validateLogBatch(partialEntries);

  const corruptedLines = detectCorruptedLines(content);

  const banner: VendorDetectionBanner = {
    vendor: detection.vendor,
    format: detection.format,
    confidence: detection.confidence,
    entriesProcessed: normalizedEntries.length,
    entriesFixed: fixedCount,
  };

  return {
    entries: normalizedEntries,
    detection,
    banner,
    validationSummary: {
      totalEntries: rawEntries.length,
      validEntries: normalizedEntries.length - fixedCount,
      fixedEntries: fixedCount,
      corruptedLines,
      warnings: [...new Set(allWarnings)].slice(0, 5),
    },
  };
}

function parseLogContent(content: string, format: string): Record<string, unknown>[] {
  if (format === 'JSON') {
    return parseJSON(content);
  }

  if (format === 'CSV') {
    return parseCSV(content);
  }

  if (format === 'TXT' || format === 'OCPP') {
    return parseTXT(content);
  }

  return [];
}

function parseJSON(content: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === 'object' && item !== null);
    }

    if (typeof parsed === 'object' && parsed !== null) {
      return [parsed];
    }

    return [];
  } catch (error) {
    console.error('JSON parsing error:', error);
    return [];
  }
}

function parseCSV(content: string): Record<string, unknown>[] {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));

  const entries: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));

    if (values.length !== headers.length) {
      continue;
    }

    const entry: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j];
    }

    entries.push(entry);
  }

  return entries;
}

function parseTXT(content: string): Record<string, unknown>[] {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  const entries: Record<string, unknown>[] = [];

  for (const line of lines) {
    const entry = parseTXTLine(line);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

function parseTXTLine(line: string): Record<string, unknown> | null {
  const timestampPattern = /\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/;
  const timestampMatch = line.match(timestampPattern);

  const errorPattern = /(ERROR|FAULT|ALARM|WARNING|CRITICAL)[:|\s]+([A-Z0-9_]+)/i;
  const errorMatch = line.match(errorPattern);

  const connectorPattern = /connector[:\s]+(\d+)/i;
  const connectorMatch = line.match(connectorPattern);

  if (!timestampMatch && !errorMatch) {
    return null;
  }

  const entry: Record<string, unknown> = {
    timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
    errorCode: errorMatch ? errorMatch[2] : 'UNKNOWN',
    connectorId: connectorMatch ? connectorMatch[1] : '0',
    status: errorMatch ? errorMatch[1] : 'Unknown',
    vendorErrorString: line,
  };

  return entry;
}

export function mergeNormalizedEntries(
  existing: NormalizedLogEntry[],
  newEntries: NormalizedLogEntry[]
): NormalizedLogEntry[] {
  const merged = [...existing, ...newEntries];

  merged.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB;
  });

  return merged;
}
