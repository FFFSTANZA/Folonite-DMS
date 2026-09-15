import type { LogEntry } from '@/types/fault';

export function parseCSV(content: string): LogEntry[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const entries: LogEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const entry: LogEntry = { rawData: lines[i] };

    headers.forEach((header, index) => {
      const value = values[index];
      if (!value) return;

      if (header.includes('error') || header.includes('code')) {
        entry.errorCode = value;
      } else if (header.includes('time') || header.includes('date')) {
        entry.timestamp = value;
      } else if (header.includes('connector')) {
        entry.connectorId = value;
      } else if (header.includes('charger')) {
        entry.chargerId = value;
      } else if (header.includes('meter') || header.includes('value')) {
        entry.meterValue = parseFloat(value);
      } else if (header.includes('temp')) {
        entry.temperature = parseFloat(value);
      } else if (header.includes('voltage')) {
        entry.voltage = parseFloat(value);
      } else if (header.includes('current')) {
        entry.current = parseFloat(value);
      } else if (header.includes('ocpp') || header.includes('status')) {
        entry.ocppStatus = value;
      } else if (header.includes('stop') || header.includes('reason')) {
        entry.transactionStopReason = value;
      } else if (header.includes('vendor')) {
        entry.vendorError = value;
      }
    });

    if (entry.errorCode || entry.vendorError || entry.transactionStopReason) {
      entries.push(entry);
    }
  }

  return entries;
}

export function parseJSON(content: string): LogEntry[] {
  try {
    const data = JSON.parse(content);
    const entries: LogEntry[] = [];

    const processObject = (obj: Record<string, unknown>): LogEntry => {
      const entry: LogEntry = { rawData: JSON.stringify(obj) };

      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = obj[key];

        if (lowerKey.includes('error') || lowerKey.includes('code')) {
          entry.errorCode = String(value);
        } else if (lowerKey.includes('time') || lowerKey.includes('date')) {
          entry.timestamp = String(value);
        } else if (lowerKey.includes('connector')) {
          entry.connectorId = String(value);
        } else if (lowerKey.includes('meter') || lowerKey.includes('value')) {
          entry.meterValue = Number(value);
        } else if (lowerKey.includes('temp')) {
          entry.temperature = Number(value);
        } else if (lowerKey.includes('voltage')) {
          entry.voltage = Number(value);
        } else if (lowerKey.includes('current')) {
          entry.current = Number(value);
        } else if (lowerKey.includes('ocpp') || lowerKey.includes('status')) {
          entry.ocppStatus = String(value);
        } else if (lowerKey.includes('stop') || lowerKey.includes('reason')) {
          entry.transactionStopReason = String(value);
        } else if (lowerKey.includes('vendor')) {
          entry.vendorError = String(value);
        }
      });

      return entry;
    };

    if (Array.isArray(data)) {
      data.forEach(item => {
        const entry = processObject(item);
        if (entry.errorCode || entry.vendorError || entry.transactionStopReason) {
          entries.push(entry);
        }
      });
    } else {
      const entry = processObject(data);
      if (entry.errorCode || entry.vendorError || entry.transactionStopReason) {
        entries.push(entry);
      }
    }

    return entries;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return [];
  }
}

export function parseTXT(content: string): LogEntry[] {
  const lines = content.trim().split('\n');
  const entries: LogEntry[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const entry: LogEntry = { rawData: line };

    const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
    if (timestampMatch) {
      entry.timestamp = timestampMatch[0];
    }

    const errorCodeMatch = line.match(/(?:error|code|err)[\s:=]+([A-Z0-9_-]+)/i);
    if (errorCodeMatch) {
      entry.errorCode = errorCodeMatch[1];
    }

    const connectorMatch = line.match(/(?:connector|conn)[\s:=]+(\d+)/i);
    if (connectorMatch) {
      entry.connectorId = connectorMatch[1];
    }

    const tempMatch = line.match(/(?:temp|temperature)[\s:=]+([\d.]+)/i);
    if (tempMatch) {
      entry.temperature = parseFloat(tempMatch[1]);
    }

    const voltageMatch = line.match(/(?:voltage|volt)[\s:=]+([\d.]+)/i);
    if (voltageMatch) {
      entry.voltage = parseFloat(voltageMatch[1]);
    }

    const currentMatch = line.match(/(?:current|amp)[\s:=]+([\d.]+)/i);
    if (currentMatch) {
      entry.current = parseFloat(currentMatch[1]);
    }

    const ocppMatch = line.match(/(?:ocpp|status)[\s:=]+([A-Za-z]+)/i);
    if (ocppMatch) {
      entry.ocppStatus = ocppMatch[1];
    }

    const reasonMatch = line.match(/(?:reason|stop)[\s:=]+([A-Za-z\s]+)/i);
    if (reasonMatch) {
      entry.transactionStopReason = reasonMatch[1].trim();
    }

    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fault') || line.toLowerCase().includes('fail')) {
      entry.vendorError = line;
    }

    if (entry.errorCode || entry.vendorError || entry.transactionStopReason) {
      entries.push(entry);
    }
  }

  return entries;
}

export function parseLogFile(file: File): Promise<LogEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      let entries: LogEntry[] = [];

      const extension = file.name.split('.').pop()?.toLowerCase();

      switch (extension) {
        case 'csv':
          entries = parseCSV(content);
          break;
        case 'json':
          entries = parseJSON(content);
          break;
        case 'txt':
        case 'log':
          entries = parseTXT(content);
          break;
        default:
          entries = parseTXT(content);
      }

      resolve(entries);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
