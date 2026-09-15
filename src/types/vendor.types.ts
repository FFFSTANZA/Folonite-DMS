export type VendorName = 
  | 'Delta'
  | 'ABB'
  | 'Exicom'
  | 'Servotech'
  | 'Fortum'
  | 'Statiq'
  | 'Tata Power'
  | 'Charge+Zone'
  | 'OCPP 1.6J'
  | 'Custom OEM'
  | 'Unknown';

export type LogFormat = 
  | 'CSV'
  | 'JSON'
  | 'TXT'
  | 'OCPP'
  | 'Mixed';

export interface VendorSignature {
  vendor: VendorName;
  patterns: string[];
  headerPatterns?: string[];
  jsonKeyPatterns?: string[];
  confidence: number;
}

export interface FieldMapping {
  standardField: string;
  vendorFields: string[];
  transform?: (value: string) => string | number;
}

export interface NormalizedLogEntry {
  timestamp: string;
  errorCode: string;
  connectorId: string;
  status: string;
  voltage: number | null;
  current: number | null;
  meterValue: number | null;
  temperature: number | null;
  vendorErrorString: string;
  restartCount: number;
  rawData?: Record<string, unknown>;
}

export interface DetectionResult {
  vendor: VendorName;
  format: LogFormat;
  confidence: number;
  fieldMappings: Map<string, string>;
  warnings: string[];
}

export interface ValidationResult {
  isValid: boolean;
  fixedCount: number;
  warnings: string[];
  errors: string[];
}

export interface VendorDetectionBanner {
  vendor: VendorName;
  format: LogFormat;
  confidence: number;
  entriesProcessed: number;
  entriesFixed: number;
}
