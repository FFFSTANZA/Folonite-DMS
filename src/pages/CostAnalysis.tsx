import { useState } from 'react';
import { useGlobalData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, Clock, Zap, FileDown } from 'lucide-react';
import { exportCostAnalysisToPDF } from '@/utils/exportUtils';

export default function CostAnalysis() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();
  
  const [avgSessionValue, setAvgSessionValue] = useState(120);
  const [avgSessionsPerDay, setAvgSessionsPerDay] = useState(14);

  // Calculate total downtime
  const totalDowntimeHours = globalParsedLogsData.reduce((sum, fault) => sum + fault.downtime, 0);
  
  // Calculate revenue loss
  const dailyRevenueLoss = (totalDowntimeHours / 24) * avgSessionsPerDay * avgSessionValue;
  const monthlyRevenueLoss = dailyRevenueLoss * 30;

  // Group faults by type for cost breakdown
  const faultTypeCosts = globalParsedLogsData.reduce((acc, fault) => {
    const loss = (fault.downtime / 24) * avgSessionsPerDay * avgSessionValue;
    if (!acc[fault.faultType]) {
      acc[fault.faultType] = { count: 0, totalLoss: 0, downtime: 0 };
    }
    acc[fault.faultType].count += 1;
    acc[fault.faultType].totalLoss += loss;
    acc[fault.faultType].downtime += fault.downtime;
    return acc;
  }, {} as Record<string, { count: number; totalLoss: number; downtime: number }>);

  // Sort by total loss
  const sortedFaultTypes = Object.entries(faultTypeCosts)
    .sort(([, a], [, b]) => b.totalLoss - a.totalLoss)
    .slice(0, 5);

  const handleExportPDF = () => {
    const costData = {
      totalDowntime: totalDowntimeHours,
      dailyLoss: dailyRevenueLoss,
      monthlyLoss: monthlyRevenueLoss,
      avgSessionValue,
      avgSessionsPerDay,
      faultTypeCosts: sortedFaultTypes,
    };
    exportCostAnalysisToPDF(costData);
  };

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cost Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Revenue loss calculations and financial impact assessment
          </p>
        </div>
        {isProcessed && globalParsedLogsData.length > 0 && (
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        )}
      </div>

      {!isProcessed ? (
        <Card className="">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Upload charger logs from the Dashboard Home to view cost analysis
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cost Parameters */}
          <Card className="">
            <CardHeader>
              <CardTitle>Revenue Parameters</CardTitle>
              <CardDescription>
                Adjust these values to match your business model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-value">Average Session Value (₹)</Label>
                  <Input
                    id="session-value"
                    type="number"
                    value={avgSessionValue}
                    onChange={(e) => setAvgSessionValue(Number(e.target.value))}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Average revenue per charging session
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessions-per-day">Average Sessions per Day</Label>
                  <Input
                    id="sessions-per-day"
                    type="number"
                    value={avgSessionsPerDay}
                    onChange={(e) => setAvgSessionsPerDay(Number(e.target.value))}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected daily charging sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Loss Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalDowntimeHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cumulative charger downtime
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Revenue Loss</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  ₹{dailyRevenueLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated loss today
                </p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue Loss</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  ₹{monthlyRevenueLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Projected monthly impact
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown by Fault Type */}
          <Card className="">
            <CardHeader>
              <CardTitle>Top 5 Costliest Fault Types</CardTitle>
              <CardDescription>
                Fault categories ranked by revenue impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedFaultTypes.map(([faultType, data], index) => (
                  <div key={faultType} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                          <h3 className="font-semibold text-lg">{faultType}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.count} occurrence{data.count !== 1 ? 's' : ''} • {data.downtime.toFixed(1)}h downtime
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-destructive">
                          ₹{data.totalLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue loss</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive"
                          style={{
                            width: `${(data.totalLoss / sortedFaultTypes[0][1].totalLoss) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {sortedFaultTypes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No cost data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className=" bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Faults Detected:</span>
                  <span className="text-lg font-bold">{globalParsedLogsData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Downtime:</span>
                  <span className="text-lg font-bold">{totalDowntimeHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Loss per Fault:</span>
                  <span className="text-lg font-bold">
                    ₹{(dailyRevenueLoss / globalParsedLogsData.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="border-t border-primary/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Estimated Monthly Loss:</span>
                    <span className="text-2xl font-bold text-destructive">
                      ₹{monthlyRevenueLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
