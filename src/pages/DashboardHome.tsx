import { Activity, AlertTriangle, BarChart3, Database, TrendingUp, Upload, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalData } from '@/context/DataContext';

export default function DashboardHome() {
  const {
    globalParsedLogsData: faults,
    siteMetrics,
    healthData,
    isProcessed,
  } = useGlobalData();

  const metrics = useMemo(() => {
    const defaultMetrics = {
      todayFaults: 0,
      totalFaults: 0,
      todayLoss: 0,
      monthLoss: 0,
      criticalAlerts: 0,
      highRiskChargers: 0,
      avgHealthScore: 0,
    };

    if (!isProcessed) return defaultMetrics;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayFaults = faults.filter(f => {
      const faultDate = new Date(f.timestamp);
      faultDate.setHours(0, 0, 0, 0);
      return faultDate.getTime() === todayTimestamp;
    }).length;

    const totalFaults = faults.length;
    const avgSessionValue = 120;
    const avgSessionsPerDay = 14;

    const todayDowntime = faults
      .filter(f => {
        const faultDate = new Date(f.timestamp);
        faultDate.setHours(0, 0, 0, 0);
        return faultDate.getTime() === todayTimestamp;
      })
      .reduce((sum, f) => sum + f.downtime, 0);

    const todayLoss = Math.round((todayDowntime / 24) * avgSessionValue * avgSessionsPerDay);
    const totalDowntime = faults.reduce((sum, f) => sum + f.downtime, 0);
    const monthLoss = Math.round((totalDowntime / 24) * avgSessionValue * avgSessionsPerDay);

    const criticalAlerts = healthData.filter(h => h.riskLevel === 'Critical').length;
    const highRiskChargers = healthData.filter(h =>
      h.riskLevel === 'Critical' || h.riskLevel === 'High'
    ).length;

    const avgHealthScore = healthData.length > 0
      ? Math.round(healthData.reduce((sum, h) => sum + h.healthScore, 0) / healthData.length)
      : 0;

    return { todayFaults, totalFaults, todayLoss, monthLoss, criticalAlerts, highRiskChargers, avgHealthScore };
  }, [faults, healthData, isProcessed]);

  const topSites = useMemo(() => {
    if (!isProcessed || siteMetrics.length === 0) return [];
    return siteMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3)
      .map(site => ({ name: site.siteId, revenue: site.totalRevenue, sessions: site.totalSessions }));
  }, [siteMetrics, isProcessed]);

  const faultDistribution = useMemo(() => {
    if (!isProcessed || faults.length === 0) return [];
    const distribution = new Map<string, number>();
    faults.forEach(f => distribution.set(f.faultType, (distribution.get(f.faultType) || 0) + 1));

    const colorMap: Record<string, string> = {
      'Overheating': 'bg-red-400',
      'OCPP network disconnect': 'bg-amber-400',
      'Overvoltage': 'bg-orange-400',
      'Low grid voltage': 'bg-orange-300',
      'Power module failure': 'bg-red-500',
      'Overcurrent': 'bg-amber-500',
      'BMS communication mismatch': 'bg-primary',
      'Emergency stop': 'bg-red-600',
      'Contactor stuck': 'bg-purple-400',
      'Repeated soft restarts': 'bg-amber-300',
      'Vehicle-side abort': 'bg-muted-foreground/30',
    };

    return Array.from(distribution.entries())
      .map(([type, count]) => ({ type, count, color: colorMap[type] || 'bg-muted-foreground/30' }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [faults, isProcessed]);

  const sitesNeedingAttention = useMemo(() => {
    if (!isProcessed || healthData.length === 0) return [];
    return healthData
      .filter(h => h.riskLevel === 'Critical' || h.riskLevel === 'High')
      .sort((a, b) => {
        const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      })
      .slice(0, 3)
      .map(h => ({ name: h.chargerId, issue: h.patterns[0] || 'Multiple issues detected', risk: h.riskLevel }));
  }, [healthData, isProcessed]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5 text-[13px]">
            Real-time insights into your EV charging operations
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 w-full sm:w-auto">
          <Link to="/data-import">
            <Upload className="h-3.5 w-3.5" />
            Import Data
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {!isProcessed && (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-14">
            <div className="rounded-2xl bg-muted/60 p-4 mb-4">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">No Data Yet</h3>
            <p className="text-[13px] text-muted-foreground mb-4 text-center max-w-sm leading-relaxed">
              Upload charger logs to see insights and analytics
            </p>
            <Button asChild size="sm">
              <Link to="/data-import">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Import Data
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      {isProcessed && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Faults"
            value={String(metrics.totalFaults)}
            sub={metrics.todayFaults > 0 ? `${metrics.todayFaults} today` : 'Total in data'}
            link="/fault-diagnosis"
            linkColor="text-primary"
          />
          <MetricTile
            label="Revenue Loss"
            value={`₹${(metrics.todayLoss > 0 ? metrics.todayLoss : metrics.monthLoss).toLocaleString()}`}
            sub={metrics.todayLoss > 0 ? `Today • ₹${metrics.monthLoss.toLocaleString()} total` : 'Total estimated loss'}
            link="/cost-analysis"
            linkColor="text-primary"
          />
          <MetricTile
            label="Critical Risk"
            value={String(metrics.criticalAlerts)}
            sub={`${metrics.highRiskChargers} need attention`}
            link="/predictive"
            linkColor="text-destructive"
            valueColor="text-destructive"
          />
          <MetricTile
            label="Fleet Health"
            value={`${metrics.avgHealthScore}%`}
            sub="Average health score"
            link="/predictive"
            linkColor="text-primary"
            valueColor={metrics.avgHealthScore >= 70 ? 'text-green-600' : metrics.avgHealthScore >= 40 ? 'text-amber-600' : 'text-destructive'}
          />
        </div>
      )}

      {/* Secondary Widgets */}
      {isProcessed && (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Earning Sites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px]">
                <div className="h-5 w-5 rounded-md bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
                Top Earning Sites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topSites.length > 0 ? (
                <>
                  {topSites.map((site, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-[13px] font-medium">{site.name}</p>
                        <p className="text-[11px] text-muted-foreground">{site.sessions} sessions</p>
                      </div>
                      <p className="text-[13px] font-semibold text-green-600">₹{site.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                  <Link to="/performance-analytics" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full">View All</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-[13px] text-muted-foreground">No data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fault Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px]">
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-3 w-3 text-primary" />
                </div>
                Fault Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {faultDistribution.length > 0 ? (
                <>
                  {faultDistribution.map((fault, index) => {
                    const maxCount = Math.max(...faultDistribution.map(f => f.count));
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-medium truncate pr-2">{fault.type}</span>
                          <span className="text-muted-foreground text-[11px] tabular-nums flex-shrink-0">{fault.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${fault.color} rounded-full transition-all duration-500`}
                            style={{ width: `${(fault.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Link to="/fault-diagnosis" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full">View All</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-[13px] text-muted-foreground">No faults yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sites Needing Attention */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px]">
                <div className="h-5 w-5 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                </div>
                Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {sitesNeedingAttention.length > 0 ? (
                <>
                  {sitesNeedingAttention.map((site, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 py-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{site.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{site.issue}</p>
                      </div>
                      <Badge
                        variant={site.risk === 'Critical' ? 'destructive' : 'warning'}
                        className="flex-shrink-0"
                      >
                        {site.risk}
                      </Badge>
                    </div>
                  ))}
                  <Link to="/predictive" className="block pt-1">
                    <Button variant="destructive" size="sm" className="w-full">View All</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-[13px] text-muted-foreground">All healthy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {isProcessed && (
        <div className="flex flex-wrap gap-2">
          <Link to="/fault-diagnosis">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Fault Logs
            </Button>
          </Link>
          <Link to="/performance-analytics">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Session Data
            </Button>
          </Link>
          <Link to="/predictive">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Predictive Analysis
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Metric Tile — Apple-style minimal KPI card ── */

function MetricTile({
  label,
  value,
  sub,
  link,
  linkColor = 'text-primary',
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  link: string;
  linkColor?: string;
  valueColor?: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${valueColor || 'text-foreground'}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{sub}</p>
        <Link to={link} className="block pt-1">
          <span className={`text-[11px] font-semibold ${linkColor} hover:underline`}>View →</span>
        </Link>
      </CardContent>
    </Card>
  );
}
