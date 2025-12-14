import { useGlobalData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Activity, TrendingDown, Zap } from 'lucide-react';

export default function PredictiveFailure() {
  const { healthData, isProcessed } = useGlobalData();

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>;
      case 'High':
        return <Badge className="bg-orange-500 text-white gap-1"><AlertTriangle className="h-3 w-3" />High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-500 text-white gap-1"><Activity className="h-3 w-3" />Medium</Badge>;
      case 'Low':
        return <Badge variant="secondary" className="gap-1"><Activity className="h-3 w-3" />Low</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-600';
    if (score >= 50) return 'bg-yellow-600';
    if (score >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Summary stats
  const criticalCount = healthData.filter(h => h.riskLevel === 'Critical').length;
  const highCount = healthData.filter(h => h.riskLevel === 'High').length;
  const avgHealthScore = healthData.length > 0
    ? Math.round(healthData.reduce((sum, h) => sum + h.healthScore, 0) / healthData.length)
    : 0;
  const totalEstimatedLoss = healthData.reduce((sum, h) => sum + h.estimatedLoss, 0);

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Predictive Failure Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Charger health monitoring and risk assessment for preventive maintenance
        </p>
      </div>

      {!isProcessed ? (
        <Card className="">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Upload charger logs from the Dashboard Home to view predictive failure analysis
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
                <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getHealthColor(avgHealthScore)}`}>
                  {avgHealthScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of 100
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{criticalCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chargers need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{highCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chargers require monitoring
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Loss</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{totalEstimatedLoss.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Potential revenue at risk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charger Health Details */}
          <Card className="">
            <CardHeader>
              <CardTitle>Charger Health Status</CardTitle>
              <CardDescription>
                Individual charger health scores, risk levels, and detected patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {healthData.map((health) => (
                  <div
                    key={health.chargerId}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{health.chargerId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last fault: {new Date(health.lastFaultDate).toLocaleDateString()}
                        </p>
                      </div>
                      {getRiskBadge(health.riskLevel)}
                    </div>

                    {/* Health Score Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Health Score</span>
                        <span className={`font-bold ${getHealthColor(health.healthScore)}`}>
                          {health.healthScore}/100
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={health.healthScore} className="h-3" />
                        <div
                          className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(health.healthScore)}`}
                          style={{ width: `${health.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Faults</p>
                        <p className="text-lg font-semibold">{health.faultCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Loss</p>
                        <p className="text-lg font-semibold">₹{health.estimatedLoss.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Detected Patterns */}
                    <div>
                      <p className="text-sm font-medium mb-2">Detected Patterns:</p>
                      <ul className="space-y-1">
                        {health.patterns.map((pattern, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                {healthData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No charger health data available</p>
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
