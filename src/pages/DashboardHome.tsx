import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, TrendingUp, AlertTriangle, Zap, BarChart3, Upload, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGlobalData } from '@/context/DataContext';

export default function DashboardHome() {
  const {
    globalParsedLogsData: faults,
    siteMetrics,
    healthData,
    isProcessed,
  } = useGlobalData();

  // Calculate dynamic metrics from real data
  const metrics = useMemo(() => {
    // Default values
    const defaultMetrics = {
      todayFaults: 0,
      totalFaults: 0,
      todayLoss: 0,
      monthLoss: 0,
      criticalAlerts: 0,
      highRiskChargers: 0,
      avgHealthScore: 0,
    };

    if (!isProcessed) {
      return defaultMetrics;
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Calculate today's faults
    const todayFaults = faults.filter(f => {
      const faultDate = new Date(f.timestamp);
      faultDate.setHours(0, 0, 0, 0);
      return faultDate.getTime() === todayTimestamp;
    }).length;

    // Total faults count
    const totalFaults = faults.length;

    // Calculate revenue loss
    const avgSessionValue = 120; // ₹120
    const avgSessionsPerDay = 14;
    
    const todayDowntime = faults
      .filter(f => {
        const faultDate = new Date(f.timestamp);
        faultDate.setHours(0, 0, 0, 0);
        return faultDate.getTime() === todayTimestamp;
      })
      .reduce((sum, f) => sum + f.downtime, 0);
    
    const todayLoss = Math.round((todayDowntime / 24) * avgSessionValue * avgSessionsPerDay);

    // Calculate month loss (approximate based on total faults)
    const totalDowntime = faults.reduce((sum, f) => sum + f.downtime, 0);
    const monthLoss = Math.round((totalDowntime / 24) * avgSessionValue * avgSessionsPerDay);

    // Count critical and high severity faults
    const criticalAlerts = faults.filter(f => f.severity === 'Critical').length;
    
    // Count high-risk chargers
    const highRiskChargers = healthData.filter(h => 
      h.riskLevel === 'Critical' || h.riskLevel === 'High'
    ).length;

    // Calculate average health score
    const avgHealthScore = healthData.length > 0
      ? Math.round(healthData.reduce((sum, h) => sum + h.healthScore, 0) / healthData.length)
      : 0;

    return {
      todayFaults,
      totalFaults,
      todayLoss,
      monthLoss,
      criticalAlerts,
      highRiskChargers,
      avgHealthScore,
    };
  }, [faults, healthData, isProcessed]);

  // Calculate top sites from real data
  const topSites = useMemo(() => {
    if (!isProcessed) {
      return [];
    }
    
    if (siteMetrics.length === 0) {
      return [];
    }
    
    return siteMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3)
      .map(site => ({
        name: site.siteId,
        revenue: site.totalRevenue,
        sessions: site.totalSessions,
      }));
  }, [siteMetrics, isProcessed]);

  // Calculate fault distribution from real data
  const faultDistribution = useMemo(() => {
    if (!isProcessed) {
      return [];
    }

    if (faults.length === 0) {
      return [];
    }

    const distribution = new Map<string, number>();
    faults.forEach(f => {
      distribution.set(f.faultType, (distribution.get(f.faultType) || 0) + 1);
    });

    const colorMap: Record<string, string> = {
      'Overheating': 'bg-destructive',
      'OCPP network disconnect': 'bg-warning',
      'Overvoltage': 'bg-chart-3',
      'Low grid voltage': 'bg-chart-3',
      'Power module failure': 'bg-chart-4',
      'Overcurrent': 'bg-chart-2',
      'BMS communication mismatch': 'bg-chart-1',
      'Emergency stop': 'bg-destructive',
      'Contactor stuck': 'bg-chart-5',
      'Repeated soft restarts': 'bg-warning',
      'Vehicle-side abort': 'bg-muted',
    };

    return Array.from(distribution.entries())
      .map(([type, count]) => ({
        type,
        count,
        color: colorMap[type] || 'bg-muted',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [faults, isProcessed]);

  // Get chargers needing attention from health data
  const sitesNeedingAttention = useMemo(() => {
    if (!isProcessed) {
      return [];
    }

    if (healthData.length === 0) {
      return [];
    }

    return healthData
      .filter(h => h.riskLevel === 'Critical' || h.riskLevel === 'High')
      .sort((a, b) => {
        const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      })
      .slice(0, 3)
      .map(h => ({
        name: h.chargerId,
        issue: h.patterns[0] || 'Multiple issues detected',
        risk: h.riskLevel,
      }));
  }, [healthData, isProcessed]);

  return (
    <div className="space-y-8 ">
      {/* Header with Import Button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights into your EV charging operations
          </p>
        </div>
        <Button 
          asChild
          size="lg"
          className="gap-2"
        >
          <Link to="/data-import">
            <Upload className="h-5 w-5" />
            Import Data
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {!isProcessed && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Uploaded</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Upload your charger log files to see real-time insights and analytics
            </p>
            <Button asChild>
              <Link to="/data-import">
                <Upload className="mr-2 h-4 w-4" />
                Import Data Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top Widgets - Large Cards */}
      {isProcessed && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faults Detected</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-3xl font-bold">{metrics.totalFaults}</div>
              <p className="text-xs text-muted-foreground mt-1 flex-1">
                {metrics.todayFaults > 0 
                  ? `${metrics.todayFaults} detected today` 
                  : 'Total faults in uploaded data'}
              </p>
              <Link to="/fault-diagnosis" className="mt-3">
                <Button variant="link" className="h-auto p-0 text-primary font-medium">
                  View Details →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Loss</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-3xl font-bold">
                ₹{(metrics.todayLoss > 0 ? metrics.todayLoss : metrics.monthLoss).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex-1">
                {metrics.todayLoss > 0 
                  ? `Today • ₹${metrics.monthLoss.toLocaleString()} total` 
                  : 'Total estimated loss from downtime'}
              </p>
              <Link to="/cost-analysis" className="mt-3">
                <Button variant="link" className="h-auto p-0 text-primary font-medium">
                  View Analysis →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-3xl font-bold text-destructive">{metrics.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1 flex-1">
                {metrics.highRiskChargers} high-risk chargers detected
              </p>
              <Link to="/predictive" className="mt-3">
                <Button variant="link" className="h-auto p-0 text-destructive font-medium">
                  View Alerts →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-3xl font-bold">{metrics.avgHealthScore}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex-1">
                Average charger health score
              </p>
              <Link to="/predictive" className="mt-3">
                <Button variant="link" className="h-auto p-0 text-primary font-medium">
                  View Health →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Widgets */}
      {isProcessed && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Earning Sites */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Earning Sites
              </CardTitle>
            <CardDescription>Highest revenue generators this month</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            {topSites.length > 0 ? (
              <>
                <div className="space-y-4 flex-1">
                  {topSites.map((site, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.sessions} sessions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">₹{site.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/performance-analytics" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Sites
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fault Distribution */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Fault Distribution
            </CardTitle>
            <CardDescription>Most common issues detected</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            {faultDistribution.length > 0 ? (
              <>
                <div className="space-y-3 flex-1">
                  {faultDistribution.map((fault, index) => {
                    const maxCount = Math.max(...faultDistribution.map(f => f.count));
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{fault.type}</span>
                          <span className="text-muted-foreground">{fault.count}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${fault.color} transition-smooth`}
                            style={{ width: `${(fault.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/fault-diagnosis" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Faults
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No faults detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sites Needing Attention */}
        <Card className="border-destructive/50 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Immediate Attention
            </CardTitle>
            <CardDescription>Chargers requiring urgent action</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            {sitesNeedingAttention.length > 0 ? (
              <>
                <div className="space-y-3 flex-1">
                  {sitesNeedingAttention.map((site, index) => (
                    <div key={index} className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{site.name}</p>
                        <p className="text-xs text-muted-foreground">{site.issue}</p>
                      </div>
                      <Badge
                        variant={site.risk === 'Critical' ? 'destructive' : 'default'}
                        className="flex-shrink-0"
                      >
                        {site.risk}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link to="/predictive" className="w-full">
                  <Button variant="destructive" className="w-full">
                    View All Alerts
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">All chargers healthy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Quick Actions */}
      <Card className="">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/fault-diagnosis">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              Upload Fault Logs
            </Button>
          </Link>
          <Link to="/performance-analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Upload Session Data
            </Button>
          </Link>
          <Link to="/predictive">
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Run Predictive Analysis
            </Button>
          </Link>
          <Link to="/help">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              View Documentation
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
