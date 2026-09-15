import type { DetectionResult, LogFormat, VendorName } from '@/types/vendor.types';
import { detectVendorFromContent, detectOCPPEvents } from './vendorSignatures';
import { extractHeadersFromCSV, extractKeysFromJSON, buildFieldMappingReport } from './fieldMapper';

export function detectLogFormat(content: string, filename: string): LogFormat {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension === 'json') {
    return 'JSON';
  }

  if (extension === 'csv') {
    return 'CSV';
  }

  if (extension === 'txt' || extension === 'log') {
    const hasOCPP = detectOCPPEvents(content);
    if (hasOCPP) {
      return 'OCPP';
    }
    return 'TXT';
  }

  const trimmedContent = content.trim();

  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    try {
      JSON.parse(trimmedContent);
      return 'JSON';
    } catch {
      return 'Mixed';
    }
  }

  const firstLine = trimmedContent.split('\n')[0];
  if (firstLine.includes(',') && firstLine.split(',').length > 3) {
    return 'CSV';
  }

  const hasOCPP = detectOCPPEvents(content);
  if (hasOCPP) {
    return 'OCPP';
  }

  return 'TXT';
}

export function detectVendorAndFormat(
  content: string,
  filename: string
): DetectionResult {
  const format = detectLogFormat(content, filename);
  const vendorSignature = detectVendorFromContent(content);

  let vendor: VendorName = 'Unknown';
  let confidence = 0;

  if (vendorSignature) {
    vendor = vendorSignature.vendor;
    confidence = vendorSignature.confidence;
  } else {
    const hasOCPP = detectOCPPEvents(content);
    if (hasOCPP) {
      vendor = 'OCPP 1.6J';
      confidence = 0.7;
    } else {
      vendor = 'Custom OEM';
      confidence = 0.5;
    }
  }

  let headers: string[] = [];
  if (format === 'CSV') {
    headers = extractHeadersFromCSV(content);
  } else if (format === 'JSON') {
    headers = extractKeysFromJSON(content);
  }

  const fieldMappings = buildFieldMappingReport(headers);

  const warnings: string[] = [];
  if (confidence < 0.7) {
    warnings.push('Low confidence vendor detection - using generic mapping');
  }

  const unmappedFields = Array.from(fieldMappings.entries())
    .filter(([_, standardField]) => standardField === 'unmapped')
    .map(([header]) => header);

  if (unmappedFields.length > 0) {
    warnings.push(`${unmappedFields.length} fields could not be mapped: ${unmappedFields.slice(0, 3).join(', ')}`);
  }

  return {
    vendor,
    format,
    confidence,
    fieldMappings,
    warnings,
  };
}

export function getVendorDisplayName(vendor: VendorName, format: LogFormat): string {
  if (vendor === 'OCPP 1.6J') {
    return `${vendor} Standard`;
  }
  if (vendor === 'Unknown' || vendor === 'Custom OEM') {
    return `${vendor} (${format} Format)`;
  }
  return `${vendor} (${format} Format)`;
}

export function getConfidenceLevel(confidence: number): 'High' | 'Medium' | 'Low' {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}

export function generateDetectionSummary(detection: DetectionResult): string {
  const confidenceLevel = getConfidenceLevel(detection.confidence);
  const displayName = getVendorDisplayName(detection.vendor, detection.format);

  let summary = `Vendor detected: ${displayName}\n`;
  summary += `Confidence: ${confidenceLevel} (${(detection.confidence * 100).toFixed(0)}%)\n`;
  summary += `Format: ${detection.format}\n`;

  const mappedCount = Array.from(detection.fieldMappings.values())
    .filter(v => v !== 'unmapped').length;
  const totalCount = detection.fieldMappings.size;

  summary += `Fields mapped: ${mappedCount}/${totalCount}\n`;

  if (detection.warnings.length > 0) {
    summary += `\nWarnings:\n${detection.warnings.map(w => `- ${w}`).join('\n')}`;
  }

  return summary;
}
