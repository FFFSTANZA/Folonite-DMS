import { useGlobalData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileDown, Zap } from 'lucide-react';
import { exportFaultsToPDF, exportFaultsToCSV } from '@/utils/exportUtils';

export default function FaultDiagnosis() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
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
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Fault Diagnosis</h1>
          <p className="text-muted-foreground mt-2">
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
        <Card className="">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Upload charger logs from the Dashboard Home to view fault diagnosis
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faults</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{globalParsedLogsData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Detected issues
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{highSeverityCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate attention required
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">{mediumSeverityCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monitor closely
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{lowSeverityCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Routine maintenance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fault Details Table */}
          <Card className="">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Fault Details</CardTitle>
              <CardDescription className="text-base">
                Complete list of detected faults with resolution guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {globalParsedLogsData.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Faults Detected</h3>
                  <p className="text-muted-foreground">
                    No faults were found in the uploaded logs. Your chargers are operating normally.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {globalParsedLogsData.map((fault, index) => (
                    <Card key={fault.id} className="border-border/50 hover: transition-colors">
                      <CardContent className="p-6">
                        {/* Header Row - Basic Info */}
                        <div className="flex flex-wrap items-start gap-4 pb-4 border-b border-border/30">
                          {/* Timestamp */}
                          <div className="flex flex-col gap-1 min-w-[140px]">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Timestamp</span>
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-medium text-foreground">
                                {new Date(fault.timestamp).toLocaleDateString()}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {new Date(fault.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          {/* Fault Type */}
                          <div className="flex flex-col gap-1 min-w-[180px]">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Fault Type</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              <span className="font-semibold text-foreground">{fault.faultType}</span>
                            </div>
                          </div>

                          {/* Connector */}
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Connector</span>
                            <Badge variant="outline" className="font-mono w-fit">
                              {fault.connectorId}
                            </Badge>
                          </div>

                          {/* Severity */}
                          <div className="flex flex-col gap-1 min-w-[100px]">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Severity</span>
                            {getSeverityBadge(fault.severity)}
                          </div>
                        </div>

                        {/* Details Grid - Description, Root Cause, Resolution */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                          {/* Description */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Description
                              </h4>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed pl-3 border-l-2 border-primary/20">
                              {fault.description}
                            </p>
                          </div>

                          {/* Root Cause */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-muted" />
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Root Cause
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-3 border-l-2 border-yellow-500/20">
                              {fault.rootCause}
                            </p>
                          </div>

                          {/* Resolution */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Resolution
                              </h4>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed pl-3 border-l-2 border-green-500/20">
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
