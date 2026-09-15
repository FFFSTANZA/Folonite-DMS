import { Activity, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalData } from '@/context/DataContext';

export default function PredictiveFailure() {
  const { healthData, isProcessed } = useGlobalData();

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>;
      case 'High':
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />High</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="gap-1"><Activity className="h-3 w-3" />Medium</Badge>;
      case 'Low':
        return <Badge variant="success" className="gap-1"><Activity className="h-3 w-3" />Low</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-destructive';
  };

  const criticalCount = healthData.filter(h => h.riskLevel === 'Critical').length;
  const highCount = healthData.filter(h => h.riskLevel === 'High').length;
  const avgHealthScore = healthData.length > 0
    ? Math.round(healthData.reduce((sum, h) => sum + h.healthScore, 0) / healthData.length)
    : 0;
  const totalEstimatedLoss = healthData.reduce((sum, h) => sum + h.estimatedLoss, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Predictive Failure Analysis</h1>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          Charger health monitoring and risk assessment for preventive maintenance
        </p>
      </div>

      {!isProcessed ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No Data Available</h3>
            <p className="text-[13px] text-muted-foreground text-center">
              Upload charger logs from the Dashboard Home to view predictive failure analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="py-4">
              <CardContent className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Avg Health Score</p>
                <p className={`text-2xl font-bold tabular-nums tracking-tight ${getHealthColor(avgHealthScore)}`}>{avgHealthScore}</p>
                <p className="text-[11px] text-muted-foreground">Out of 100</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardContent className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Critical Risk</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-destructive">{criticalCount}</p>
                <p className="text-[11px] text-muted-foreground">Need immediate attention</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardContent className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">High Risk</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-orange-500">{highCount}</p>
                <p className="text-[11px] text-muted-foreground">Require monitoring</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardContent className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estimated Loss</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight">₹{totalEstimatedLoss.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Potential revenue at risk</p>
              </CardContent>
            </Card>
          </div>

          {/* Charger Health Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Charger Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData.map((health) => (
                  <div key={health.chargerId} className="border border-border/30 rounded-xl p-4 hover:shadow-[var(--shadow-sm)] transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[15px]">{health.chargerId}</h3>
                        <p className="text-[11px] text-muted-foreground">
                          Last fault: {new Date(health.lastFaultDate).toLocaleDateString()}
                        </p>
                      </div>
                      {getRiskBadge(health.riskLevel)}
                    </div>

                    {/* Health Score Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium text-muted-foreground">Health Score</span>
                        <span className={`font-bold tabular-nums ${getHealthColor(health.healthScore)}`}>
                          {health.healthScore}/100
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${getProgressColor(health.healthScore)}`}
                          style={{ width: `${health.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Faults</p>
                        <p className="text-[15px] font-semibold tabular-nums">{health.faultCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Estimated Loss</p>
                        <p className="text-[15px] font-semibold tabular-nums">₹{health.estimatedLoss.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Detected Patterns */}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Detected Patterns</p>
                      <ul className="space-y-1">
                        {health.patterns.map((pattern, idx) => (
                          <li key={idx} className="text-[12px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary/60 mt-0.5 text-[8px]">●</span>
                            <span className="leading-relaxed">{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                {healthData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[13px] text-muted-foreground">No charger health data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
