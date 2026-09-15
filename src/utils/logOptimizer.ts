import type { LogEntry } from '@/types/fault';

export interface OptimizationStats {
  totalLines: number;
  cleanedLines: number;
  duplicatesRemoved: number;
  noiseRemoved: number;
  faultClustersDetected: number;
  sizeReductionPercent: number;
  processingTimeMs: number;
}

export interface OptimizedLogResult {
  entries: LogEntry[];
  stats: OptimizationStats;
}

// Noise patterns to filter out
const NOISE_PATTERNS = [
  /heartbeat/i,
  /bootnotification/i,
  /ok\s+ok\s+ok/i,
  /vendor.*spam/i,
  /^[\s\t]*$/,  // Empty lines
  /^#/,  // Comment lines
];

// OCPP status updates that are typically duplicates
const DUPLICATE_STATUS_PATTERNS = [
  'Available',
  'Preparing',
  'Charging',
  'SuspendedEV',
  'SuspendedEVSE',
  'Finishing',
];

export class LogOptimizer {
  private seenHashes: Set<string> = new Set();
  private lastStatusByConnector: Map<string, string> = new Map();
  private stats: OptimizationStats = {
    totalLines: 0,
    cleanedLines: 0,
    duplicatesRemoved: 0,
    noiseRemoved: 0,
    faultClustersDetected: 0,
    sizeReductionPercent: 0,
    processingTimeMs: 0,
  };

  /**
   * Check if a line is noise and should be filtered
   */
  private isNoise(line: string | undefined): boolean {
    if (!line) return true;
    return NOISE_PATTERNS.some(pattern => pattern.test(line));
  }

  /**
   * Generate a hash for duplicate detection
   */
  private generateHash(entry: LogEntry): string {
    return `${entry.timestamp}-${entry.errorCode}-${entry.connectorId}`;
  }

  /**
   * Check if this is a duplicate OCPP status update
   */
  private isDuplicateStatus(entry: LogEntry): boolean {
    const key = `${entry.connectorId}-status`;
    const currentStatus = entry.rawData;
    
    if (!currentStatus) return false;

    // Check if this is a status update
    const isStatusUpdate = DUPLICATE_STATUS_PATTERNS.some(status => 
      currentStatus.includes(status)
    );

    if (!isStatusUpdate) return false;

    const lastStatus = this.lastStatusByConnector.get(key);
    
    if (lastStatus === currentStatus) {
      return true; // Duplicate status
    }

    this.lastStatusByConnector.set(key, currentStatus);
    return false;
  }

  /**
   * Normalize timestamp to IST
   */
  private normalizeTimestamp(timestamp: string | undefined): string {
    if (!timestamp) return new Date().toISOString();
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Invalid timestamp, use current time
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Auto-fill missing connector ID based on patterns
   */
  private autoFillConnectorId(entry: LogEntry, index: number): string {
    if (entry.connectorId && entry.connectorId !== 'Unknown') {
      return entry.connectorId;
    }

    // Try to extract from raw data
    if (entry.rawData) {
      const connectorMatch = entry.rawData.match(/connector[:\s]+(\d+)/i);
      if (connectorMatch) {
        return `Connector-${connectorMatch[1]}`;
      }
    }

    // Default pattern based on index
    return `Connector-${(index % 4) + 1}`;
  }

  /**
   * Process a single log entry
   */
  private processEntry(entry: LogEntry, index: number): LogEntry | null {
    this.stats.totalLines++;

    // Check for noise
    if (this.isNoise(entry.rawData)) {
      this.stats.noiseRemoved++;
      return null;
    }

    // Check for duplicates
    const hash = this.generateHash(entry);
    if (this.seenHashes.has(hash)) {
      this.stats.duplicatesRemoved++;
      return null;
    }
    this.seenHashes.add(hash);

    // Check for duplicate status updates
    if (this.isDuplicateStatus(entry)) {
      this.stats.duplicatesRemoved++;
      return null;
    }

    // Normalize and enhance entry
    const optimized: LogEntry = {
      ...entry,
      timestamp: this.normalizeTimestamp(entry.timestamp),
      connectorId: this.autoFillConnectorId(entry, index),
    };

    this.stats.cleanedLines++;
    return optimized;
  }

  /**
   * Detect and merge fault clusters
   */
  private detectFaultClusters(entries: LogEntry[]): LogEntry[] {
    const clusters: Map<string, LogEntry[]> = new Map();
    const result: LogEntry[] = [];

    // Group similar faults
    entries.forEach(entry => {
      if (!entry.errorCode || entry.errorCode === 'INFO') {
        result.push(entry);
        return;
      }

      const clusterKey = `${entry.errorCode}-${entry.connectorId}`;
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(entry);
    });

    // Process clusters
    clusters.forEach((clusterEntries) => {
      if (clusterEntries.length <= 2) {
        // Not a cluster, keep all entries
        result.push(...clusterEntries);
      } else {
        // Merge into a single summarized entry
        this.stats.faultClustersDetected++;
        const first = clusterEntries[0];
        const last = clusterEntries[clusterEntries.length - 1];
        
        const firstTime = first.timestamp ? new Date(first.timestamp).toLocaleTimeString() : 'unknown';
        const lastTime = last.timestamp ? new Date(last.timestamp).toLocaleTimeString() : 'unknown';
        
        const merged: LogEntry = {
          ...first,
          rawData: `${first.rawData || ''} [Occurred ${clusterEntries.length} times between ${firstTime} - ${lastTime}]`,
        };
        
        result.push(merged);
      }
    });

    return result;
  }

  /**
   * Optimize a batch of log entries
   */
  public optimize(entries: LogEntry[]): OptimizedLogResult {
    const startTime = Date.now();
    this.stats = {
      totalLines: 0,
      cleanedLines: 0,
      duplicatesRemoved: 0,
      noiseRemoved: 0,
      faultClustersDetected: 0,
      sizeReductionPercent: 0,
      processingTimeMs: 0,
    };

    // Process each entry
    const processed = entries
      .map((entry, index) => this.processEntry(entry, index))
      .filter((entry): entry is LogEntry => entry !== null);

    // Detect and merge fault clusters
    const optimized = this.detectFaultClusters(processed);

    // Calculate statistics
    this.stats.processingTimeMs = Date.now() - startTime;
    this.stats.sizeReductionPercent = this.stats.totalLines > 0
      ? Math.round(((this.stats.totalLines - this.stats.cleanedLines) / this.stats.totalLines) * 100)
      : 0;

    return {
      entries: optimized,
      stats: this.stats,
    };
  }

  /**
   * Reset optimizer state
   */
  public reset(): void {
    this.seenHashes.clear();
    this.lastStatusByConnector.clear();
  }
}

/**
 * Convenience function to optimize logs
 */
export function optimizeLogs(entries: LogEntry[]): OptimizedLogResult {
  const optimizer = new LogOptimizer();
  return optimizer.optimize(entries);
}
