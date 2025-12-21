import type { LogEntry, FaultAnalysis, FaultType, SeverityLevel } from '@/types/fault';

interface FaultRule {
  type: FaultType;
  description: string;
  rootCause: string;
  impact: string;
  severity: SeverityLevel;
  resolution: string;
  estimatedDowntime: number;
  matcher: (entry: LogEntry) => boolean;
}

const faultRules: FaultRule[] = [
  {
    type: 'Overcurrent',
    description: 'Current exceeded safe operating limits during charging session',
    rootCause: 'Vehicle battery management system requesting excessive current, or faulty current sensor providing incorrect readings',
    impact: 'Charging session terminated to prevent equipment damage and ensure safety',
    severity: 'High',
    resolution: 'Electrician required to inspect current sensors and wiring. Check vehicle BMS compatibility.',
    estimatedDowntime: 4,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('overcurrent') || 
             errorStr.includes('over current') || 
             errorStr.includes('current limit') ||
             (entry.current !== undefined && entry.current > 80);
    }
  },
  {
    type: 'Overvoltage',
    description: 'Voltage levels exceeded maximum threshold during operation',
    rootCause: 'Grid voltage fluctuation or internal voltage regulator malfunction',
    impact: 'Immediate shutdown to protect sensitive electronic components',
    severity: 'High',
    resolution: 'Vendor support needed. Check grid voltage stability and internal voltage regulation circuits.',
    estimatedDowntime: 6,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('overvoltage') || 
             errorStr.includes('over voltage') || 
             errorStr.includes('voltage high') ||
             (entry.voltage !== undefined && entry.voltage > 500);
    }
  },
  {
    type: 'Low grid voltage',
    description: 'Input grid voltage dropped below minimum operating threshold',
    rootCause: 'Utility grid instability, transformer issues, or high load on local distribution',
    impact: 'Charging paused until voltage stabilizes, affecting customer experience',
    severity: 'Medium',
    resolution: 'Monitor grid voltage. Contact utility provider if persistent. Consider voltage stabilizer installation.',
    estimatedDowntime: 2,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('low voltage') || 
             errorStr.includes('under voltage') || 
             errorStr.includes('voltage drop') ||
             errorStr.includes('grid voltage') ||
             (entry.voltage !== undefined && entry.voltage < 200);
    }
  },
  {
    type: 'Overheating',
    description: 'Internal temperature exceeded safe operating limits',
    rootCause: 'Inadequate cooling, blocked ventilation, ambient temperature too high, or continuous high-power operation',
    impact: 'Thermal protection activated, charging stopped to prevent component damage',
    severity: 'High',
    resolution: 'Check cooling fans and ventilation. Clean air filters. Ensure adequate spacing around charger.',
    estimatedDowntime: 3,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('overheat') || 
             errorStr.includes('over heat') || 
             errorStr.includes('temperature') || 
             errorStr.includes('thermal') ||
             (entry.temperature !== undefined && entry.temperature > 70);
    }
  },
  {
    type: 'BMS communication mismatch',
    description: 'Failed to establish or maintain communication with vehicle Battery Management System',
    rootCause: 'Incompatible communication protocol, damaged charging cable, or vehicle BMS software issue',
    impact: 'Charging cannot start or stops mid-session due to lack of battery status information',
    severity: 'Medium',
    resolution: 'Check charging cable for damage. Update charger firmware. Test with different vehicles to isolate issue.',
    estimatedDowntime: 2,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('bms') || 
             errorStr.includes('battery management') || 
             errorStr.includes('communication') || 
             errorStr.includes('protocol') ||
             errorStr.includes('handshake');
    }
  },
  {
    type: 'OCPP network disconnect',
    description: 'Lost connection to central management system via OCPP protocol',
    rootCause: 'Internet connectivity issue, router malfunction, or backend server downtime',
    impact: 'Charger operates in offline mode, unable to authorize transactions or report status',
    severity: 'Medium',
    resolution: 'Check internet connection and router. Verify backend server status. Simple local reset may resolve.',
    estimatedDowntime: 1,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('ocpp') || 
             errorStr.includes('network') || 
             errorStr.includes('disconnect') || 
             errorStr.includes('offline') ||
             errorStr.includes('connection lost') ||
             entry.ocppStatus?.toLowerCase().includes('offline');
    }
  },
  {
    type: 'Power module failure',
    description: 'Internal power conversion module stopped functioning',
    rootCause: 'Component failure in AC-DC converter, damaged power electronics, or control board malfunction',
    impact: 'Charger completely non-operational until hardware repair',
    severity: 'Critical',
    resolution: 'Vendor support needed immediately. Requires hardware replacement and technical expertise.',
    estimatedDowntime: 24,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('power module') || 
             errorStr.includes('converter') || 
             errorStr.includes('hardware fail') || 
             errorStr.includes('module fail');
    }
  },
  {
    type: 'Vehicle-side abort',
    description: 'Charging session terminated by vehicle or user action',
    rootCause: 'User manually stopped charging, vehicle reached target charge level, or vehicle BMS initiated stop',
    impact: 'Normal operation - no equipment issue',
    severity: 'Low',
    resolution: 'No action required. This is normal user behavior or vehicle-initiated stop.',
    estimatedDowntime: 0,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('evdisconnected') || 
             errorStr.includes('ev disconnect') || 
             errorStr.includes('user stop') || 
             errorStr.includes('vehicle abort') ||
             errorStr.includes('remote stop');
    }
  },
  {
    type: 'Emergency stop',
    description: 'Emergency stop button was activated',
    rootCause: 'User pressed emergency stop button due to safety concern or accidental activation',
    impact: 'Immediate power cutoff to all charging operations',
    severity: 'Critical',
    resolution: 'Inspect site for safety issues. Reset emergency stop button. Electrician may be required for inspection.',
    estimatedDowntime: 1,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('emergency') || 
             errorStr.includes('e-stop') || 
             errorStr.includes('estop') || 
             errorStr.includes('emergency stop');
    }
  },
  {
    type: 'Contactor stuck',
    description: 'Main power contactor failed to open or close properly',
    rootCause: 'Mechanical wear, contactor coil failure, or welded contacts due to arc damage',
    impact: 'Unable to safely control power delivery to vehicle',
    severity: 'Critical',
    resolution: 'Vendor support needed. Contactor replacement required by qualified technician.',
    estimatedDowntime: 8,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('contactor') || 
             errorStr.includes('relay stuck') || 
             errorStr.includes('relay fail');
    }
  },
  {
    type: 'Repeated soft restarts',
    description: 'Charger experiencing multiple automatic restart cycles',
    rootCause: 'Software bug, intermittent hardware fault, or unstable power supply causing watchdog resets',
    impact: 'Unreliable operation, frequent service interruptions',
    severity: 'Medium',
    resolution: 'Update firmware to latest version. If persists, vendor support needed for diagnostics.',
    estimatedDowntime: 4,
    matcher: (entry) => {
      const errorStr = `${entry.errorCode} ${entry.vendorError} ${entry.transactionStopReason}`.toLowerCase();
      return errorStr.includes('restart') || 
             errorStr.includes('reboot') || 
             errorStr.includes('watchdog') || 
             errorStr.includes('reset');
    }
  }
];

export function classifyFault(entry: LogEntry): FaultAnalysis | null {
  for (const rule of faultRules) {
    if (rule.matcher(entry)) {
      return {
        id: `fault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        faultType: rule.type,
        timestamp: entry.timestamp || new Date().toISOString(),
        connectorId: entry.connectorId || 'Unknown',
        description: rule.description,
        rootCause: rule.rootCause,
        impact: rule.impact,
        severity: rule.severity,
        resolution: rule.resolution,
        downtime: rule.estimatedDowntime,
        logEntry: entry
      };
    }
  }

  return null;
}

export function classifyFaults(entries: LogEntry[]): FaultAnalysis[] {
  const faults: FaultAnalysis[] = [];

  for (const entry of entries) {
    const fault = classifyFault(entry);
    if (fault) {
      faults.push(fault);
    }
  }

  return faults;
}
