import type { VendorSignature, FieldMapping } from '@/types/vendor.types';

export const VENDOR_SIGNATURES: VendorSignature[] = [
  {
    vendor: 'Delta',
    patterns: [
      'DELTA:OCPP',
      'DELTA_CP',
      'Delta Electronics',
      'DeltaCharger',
    ],
    headerPatterns: ['delta_error', 'delta_event', 'delta_status'],
    jsonKeyPatterns: ['deltaErrorCode', 'deltaConnectorId'],
    confidence: 0.95,
  },
  {
    vendor: 'ABB',
    patterns: [
      'ABB_ERR_',
      'ABB Terra',
      'ABB_CP',
      'ABBCharger',
    ],
    headerPatterns: ['abb_fault', 'abb_alarm', 'terra_log'],
    jsonKeyPatterns: ['abbErrorCode', 'terraStatus'],
    confidence: 0.95,
  },
  {
    vendor: 'Exicom',
    patterns: [
      'EXICOM-CP',
      'EXICOM_LOG',
      'Exicom Power',
      'EXI_',
    ],
    headerPatterns: ['exi_error', 'exicom_event', 'exi_status'],
    jsonKeyPatterns: ['exicomError', 'exiConnectorId'],
    confidence: 0.95,
  },
  {
    vendor: 'Servotech',
    patterns: [
      'SERVOTECH',
      'SRV_CP',
      'SERVO_LOG',
      'SRV_ERR',
    ],
    headerPatterns: ['srv_error', 'servotech_log', 'srv_event'],
    jsonKeyPatterns: ['servotechError', 'srvStatus'],
    confidence: 0.90,
  },
  {
    vendor: 'Fortum',
    patterns: [
      'FORTUM',
      'FRT_CP',
      'Fortum Charge',
      'FRT_LOG',
    ],
    headerPatterns: ['fortum_error', 'frt_event', 'fortum_status'],
    jsonKeyPatterns: ['fortumError', 'fortumConnector'],
    confidence: 0.90,
  },
  {
    vendor: 'Statiq',
    patterns: [
      'STQ_EVT',
      'STATIQ',
      'STQ_CP',
      'Statiq Log',
    ],
    headerPatterns: ['stq_error', 'statiq_event', 'stq_status'],
    jsonKeyPatterns: ['statiqError', 'stqConnectorId'],
    confidence: 0.90,
  },
  {
    vendor: 'Tata Power',
    patterns: [
      'TATA_POWER',
      'TP_CP',
      'TataPower',
      'TP_LOG',
    ],
    headerPatterns: ['tp_error', 'tata_event', 'tatapower_log'],
    jsonKeyPatterns: ['tataPowerError', 'tpConnectorId'],
    confidence: 0.90,
  },
  {
    vendor: 'Charge+Zone',
    patterns: [
      'CHARGEZONE LOG BLOCK',
      'CZ_CP',
      'ChargeZone',
      'CZ_ERR',
    ],
    headerPatterns: ['cz_error', 'chargezone_event', 'cz_status'],
    jsonKeyPatterns: ['chargeZoneError', 'czConnectorId'],
    confidence: 0.90,
  },
  {
    vendor: 'OCPP 1.6J',
    patterns: [
      'BootNotification',
      'MeterValues',
      'StatusNotification',
      'StartTransaction',
      'StopTransaction',
      'Heartbeat',
    ],
    headerPatterns: ['connectorId', 'idTag', 'meterValue', 'timestamp'],
    jsonKeyPatterns: ['connectorId', 'idTag', 'transactionId', 'meterValue'],
    confidence: 0.85,
  },
];

export const OCPP_EVENT_PATTERNS = [
  'BootNotification',
  'MeterValues',
  'StatusNotification',
  'Heartbeat',
  'StartTransaction',
  'StopTransaction',
  'Authorize',
  'DataTransfer',
  'DiagnosticsStatusNotification',
  'FirmwareStatusNotification',
];

export const FIELD_MAPPINGS: Record<string, FieldMapping> = {
  timestamp: {
    standardField: 'timestamp',
    vendorFields: [
      'timestamp',
      'time',
      'datetime',
      'event_time',
      'log_time',
      'ts',
      'date_time',
      'eventTimestamp',
      'logTimestamp',
    ],
  },
  errorCode: {
    standardField: 'errorCode',
    vendorFields: [
      'errorCode',
      'error_code',
      'err_code',
      'fault_code',
      'alarm_code',
      'errCode',
      'faultCode',
      'alarmCode',
      'error',
      'fault',
      'deltaErrorCode',
      'abbErrorCode',
      'exicomError',
    ],
  },
  connectorId: {
    standardField: 'connectorId',
    vendorFields: [
      'connectorId',
      'connector_id',
      'evse_id',
      'evseId',
      'connector',
      'port',
      'outlet',
      'EVSE_ID',
      'ConnectorId',
      'deltaConnectorId',
      'exiConnectorId',
    ],
  },
  status: {
    standardField: 'status',
    vendorFields: [
      'status',
      'state',
      'charger_status',
      'connector_status',
      'evse_status',
      'chargerStatus',
      'connectorStatus',
      'currentState',
    ],
  },
  voltage: {
    standardField: 'voltage',
    vendorFields: [
      'voltage',
      'volt',
      'v',
      'volt_r',
      'volt_s',
      'volt_t',
      'Volt_R',
      'Volt_S',
      'Volt_T',
      'voltageL1',
      'voltageL2',
      'voltageL3',
    ],
    transform: (value: string) => parseFloat(value) || 0,
  },
  current: {
    standardField: 'current',
    vendorFields: [
      'current',
      'amp',
      'a',
      'current_r',
      'current_s',
      'current_t',
      'Current_R',
      'Current_S',
      'Current_T',
      'currentL1',
      'currentL2',
      'currentL3',
    ],
    transform: (value: string) => parseFloat(value) || 0,
  },
  meterValue: {
    standardField: 'meterValue',
    vendorFields: [
      'meterValue',
      'meter_value',
      'energy',
      'kwh',
      'energy_delivered',
      'meterReading',
      'energyDelivered',
      'totalEnergy',
    ],
    transform: (value: string) => parseFloat(value) || 0,
  },
  temperature: {
    standardField: 'temperature',
    vendorFields: [
      'temperature',
      'temp',
      'temp_c',
      'Temp_C',
      'temperatureC',
      'tempCelsius',
      'internalTemp',
    ],
    transform: (value: string) => parseFloat(value) || 0,
  },
  vendorErrorString: {
    standardField: 'vendorErrorString',
    vendorFields: [
      'error_message',
      'error_msg',
      'message',
      'description',
      'error_description',
      'fault_description',
      'errorMessage',
      'errorDescription',
      'faultDescription',
    ],
  },
  restartCount: {
    standardField: 'restartCount',
    vendorFields: [
      'restart_count',
      'restartCount',
      'reboot_count',
      'reset_count',
      'restarts',
      'reboots',
    ],
    transform: (value: string) => parseInt(value, 10) || 0,
  },
};

export function detectVendorFromContent(content: string): VendorSignature | null {
  const contentLower = content.toLowerCase();
  const contentSample = content.substring(0, 5000);

  for (const signature of VENDOR_SIGNATURES) {
    let matchCount = 0;
    const totalPatterns = signature.patterns.length;

    for (const pattern of signature.patterns) {
      if (contentSample.includes(pattern) || contentLower.includes(pattern.toLowerCase())) {
        matchCount++;
      }
    }

    if (signature.headerPatterns) {
      for (const headerPattern of signature.headerPatterns) {
        if (contentLower.includes(headerPattern.toLowerCase())) {
          matchCount += 0.5;
        }
      }
    }

    if (signature.jsonKeyPatterns) {
      for (const keyPattern of signature.jsonKeyPatterns) {
        if (contentSample.includes(keyPattern)) {
          matchCount += 0.5;
        }
      }
    }

    const confidence = matchCount / totalPatterns;
    if (confidence >= 0.3) {
      return {
        ...signature,
        confidence: Math.min(confidence, 1.0),
      };
    }
  }

  return null;
}

export function detectOCPPEvents(content: string): boolean {
  let ocppEventCount = 0;
  for (const event of OCPP_EVENT_PATTERNS) {
    if (content.includes(event)) {
      ocppEventCount++;
    }
  }
  return ocppEventCount >= 2;
}
