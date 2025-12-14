import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, TrendingUp, AlertTriangle, Zap, BarChart3, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  // Mock data for demonstration
  const todayFaults = 12;
  const todayLoss = 8400;
  const monthLoss = 156000;
  const criticalAlerts = 3;
  const highRiskChargers = 5;
  const avgHealthScore = 72;

  const topSites = [
    { name: 'Mumbai Central', revenue: 45200, sessions: 156 },
    { name: 'Delhi Hub', revenue: 38900, sessions: 142 },
    { name: 'Bangalore Tech Park', revenue: 35600, sessions: 128 },
  ];

  const faultDistribution = [
    { type: 'Overheating', count: 8, color: 'bg-destructive' },
    { type: 'OCPP Disconnect', count: 6, color: 'bg-warning' },
    { type: 'Voltage Issues', count: 5, color: 'bg-chart-3' },
    { type: 'Power Module', count: 4, color: 'bg-chart-4' },
  ];

  const sitesNeedingAttention = [
    { name: 'CHG-MUM-01', issue: 'Critical overheating', risk: 'Critical' },
    { name: 'CHG-DEL-02', issue: 'OCPP disconnect', risk: 'Critical' },
    { name: 'CHG-BLR-03', issue: 'Repeated restarts', risk: 'High' },
  ];

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

      {/* Top Widgets - Large Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="  flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Faults</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-3xl font-bold">{todayFaults}</div>
            <p className="text-xs text-muted-foreground mt-1 flex-1">
              Detected issues requiring attention
            </p>
            <Link to="/fault-diagnosis" className="mt-3">
              <Button variant="link" className="h-auto p-0 text-primary font-medium">
                View Details →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="  flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downtime Loss</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-3xl font-bold">₹{todayLoss.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex-1">
              Today • ₹{monthLoss.toLocaleString()} this month
            </p>
            <Link to="/cost-analysis" className="mt-3">
              <Button variant="link" className="h-auto p-0 text-primary font-medium">
                View Analysis →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="  flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-3xl font-bold text-destructive">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1 flex-1">
              {highRiskChargers} high-risk chargers detected
            </p>
            <Link to="/predictive" className="mt-3">
              <Button variant="link" className="h-auto p-0 text-destructive font-medium">
                View Alerts →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="  flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-3xl font-bold">{avgHealthScore}%</div>
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

      {/* Secondary Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Earning Sites */}
        <Card className=" flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Top Earning Sites
            </CardTitle>
            <CardDescription>Highest revenue generators this month</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
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
          </CardContent>
        </Card>

        {/* Fault Distribution */}
        <Card className=" flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Fault Distribution
            </CardTitle>
            <CardDescription>Most common issues this week</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            <div className="space-y-3 flex-1">
              {faultDistribution.map((fault, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{fault.type}</span>
                    <span className="text-muted-foreground">{fault.count}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${fault.color} transition-smooth`}
                      style={{ width: `${(fault.count / 23) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/fault-diagnosis" className="w-full">
              <Button variant="outline" className="w-full">
                View All Faults
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Sites Needing Attention */}
        <Card className=" border-destructive/50 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Immediate Attention
            </CardTitle>
            <CardDescription>Chargers requiring urgent action</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
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
          </CardContent>
        </Card>
      </div>

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
