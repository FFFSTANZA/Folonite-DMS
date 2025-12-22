import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FaultAnalysis, SeverityLevel } from '@/types/fault';

interface FaultTableProps {
  faults: FaultAnalysis[];
}

function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'High':
      return 'bg-destructive text-destructive-foreground';
    case 'Medium':
      return 'bg-warning text-warning-foreground';
    case 'Low':
      return 'bg-success text-success-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function FaultTable({ faults }: FaultTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (faults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Detailed Fault Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                <TableHead className="min-w-[150px]">Fault Type</TableHead>
                <TableHead className="min-w-[140px]">Timestamp</TableHead>
                <TableHead className="min-w-[100px]">Connector</TableHead>
                <TableHead className="min-w-[90px]">Severity</TableHead>
                <TableHead className="text-right min-w-[100px]">Downtime (hrs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faults.map((fault) => (
                <>
                  <TableRow key={fault.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(fault.id)}
                      >
                        {expandedRows.has(fault.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{fault.faultType}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{new Date(fault.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{fault.connectorId}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(fault.severity)}>
                        {fault.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{fault.downtime}</TableCell>
                  </TableRow>
                  {expandedRows.has(fault.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-1">Description</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{fault.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-1">Root Cause</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{fault.rootCause}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-1">Impact</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{fault.impact}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-1">Resolution</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{fault.resolution}</p>
                          </div>
                          {fault.logEntry.errorCode && (
                            <div>
                              <h4 className="font-semibold text-xs sm:text-sm mb-1">Error Code</h4>
                              <code className="text-xs sm:text-sm bg-muted px-2 py-1 rounded">
                                {fault.logEntry.errorCode}
                              </code>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            {fault.logEntry.temperature !== undefined && (
                              <div>
                                <span className="font-semibold">Temperature:</span>{' '}
                                {fault.logEntry.temperature}°C
                              </div>
                            )}
                            {fault.logEntry.voltage !== undefined && (
                              <div>
                                <span className="font-semibold">Voltage:</span>{' '}
                                {fault.logEntry.voltage}V
                              </div>
                            )}
                            {fault.logEntry.current !== undefined && (
                              <div>
                                <span className="font-semibold">Current:</span>{' '}
                                {fault.logEntry.current}A
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
