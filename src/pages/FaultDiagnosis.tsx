import { AlertTriangle, FileDown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalData } from '@/context/DataContext';
import { exportFaultsToCSV, exportFaultsToPDF } from '@/utils/exportUtils';

export default function FaultDiagnosis() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const highSeverityCount = globalParsedLogsData.filter(f => f.severity === 'High').length;
  const mediumSeverityCount = globalParsedLogsData.filter(f => f.severity === 'Medium').length;
  const lowSeverityCount = globalParsedLogsData.filter(f => f.severity === 'Low').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Fault Diagnosis</h1>
          <p className="text-muted-foreground mt-0.5 text-[13px]">
            Detailed fault analysis and resolution guidance
          </p>
        </div>
        {isProcessed && globalParsedLogsData.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => exportFaultsToPDF(globalParsedLogsData)} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => exportFaultsToCSV(globalParsedLogsData)} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {!isProcessed ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No Data Available</h3>
            <p className="text-[13px] text-muted-foreground text-center">
              Upload charger logs from the Dashboard Home to view fault diagnosis
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <SummaryTile label="Total Faults" value={String(globalParsedLogsData.length)} sub="Detected issues" />
            <SummaryTile label="High Severity" value={String(highSeverityCount)} sub="Immediate attention" valueColor="text-destructive" />
            <SummaryTile label="Medium Severity" value={String(mediumSeverityCount)} sub="Monitor closely" valueColor="text-amber-600" />
            <SummaryTile label="Low Severity" value={String(lowSeverityCount)} sub="Routine maintenance" />
          </div>

          {/* Fault Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fault Details</CardTitle>
            </CardHeader>
            <CardContent>
              {globalParsedLogsData.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/60 mb-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">No Faults Detected</h3>
                  <p className="text-[13px] text-muted-foreground">
                    No faults were found in the uploaded logs. Your chargers are operating normally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {globalParsedLogsData.map((fault) => (
                    <Card key={fault.id} className="border-border/30">
                      <CardContent className="space-y-3">
                        {/* Header Row */}
                        <div className="flex flex-wrap items-start gap-4 pb-3 border-b border-border/30">
                          <div className="flex flex-col gap-0.5 min-w-[130px]">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Timestamp</span>
                            <span className="font-mono text-[13px] font-medium">
                              {new Date(fault.timestamp).toLocaleDateString()}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {new Date(fault.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-[160px]">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Fault Type</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="font-semibold text-[13px]">{fault.faultType}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-[100px]">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Connector</span>
                            <Badge variant="outline" className="font-mono w-fit text-[11px]">{fault.connectorId}</Badge>
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-[80px]">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Severity</span>
                            {getSeverityBadge(fault.severity)}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
                            <p className="text-[13px] text-foreground leading-relaxed pl-3 border-l-2 border-primary/20">
                              {fault.description}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Root Cause</h4>
                            <p className="text-[13px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-amber-300/40">
                              {fault.rootCause}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Resolution</h4>
                            <p className="text-[13px] text-foreground leading-relaxed pl-3 border-l-2 border-green-400/40">
                              {fault.resolution}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryTile({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${valueColor || 'text-foreground'}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
