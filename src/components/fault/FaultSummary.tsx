import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FaultSummaryProps {
  totalFaults: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

export function FaultSummary({
  totalFaults,
  highSeverity,
  mediumSeverity,
  lowSeverity
}: FaultSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Faults</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFaults}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Detected in log file
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Severity</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{highSeverity}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Requires immediate attention
          </p>
        </CardContent>
      </Card>

      <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{mediumSeverity}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor and address soon
          </p>
        </CardContent>
      </Card>

      <Card className="border-success/50 bg-success/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Severity</CardTitle>
          <Info className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{lowSeverity}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Normal operations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
