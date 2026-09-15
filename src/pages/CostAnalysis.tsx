import { Clock, FileDown, TrendingDown, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlobalData } from '@/context/DataContext';
import { exportCostAnalysisToPDF } from '@/utils/exportUtils';

export default function CostAnalysis() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();

  const [avgSessionValue, setAvgSessionValue] = useState(120);
  const [avgSessionsPerDay, setAvgSessionsPerDay] = useState(14);

  const totalDowntimeHours = globalParsedLogsData.reduce((sum, fault) => sum + fault.downtime, 0);
  const dailyRevenueLoss = (totalDowntimeHours / 24) * avgSessionsPerDay * avgSessionValue;
  const monthlyRevenueLoss = dailyRevenueLoss * 30;

  const faultTypeCosts = globalParsedLogsData.reduce((acc, fault) => {
    const loss = (fault.downtime / 24) * avgSessionsPerDay * avgSessionValue;
    if (!acc[fault.faultType]) acc[fault.faultType] = { count: 0, totalLoss: 0, downtime: 0 };
    acc[fault.faultType].count += 1;
    acc[fault.faultType].totalLoss += loss;
    acc[fault.faultType].downtime += fault.downtime;
    return acc;
  }, {} as Record<string, { count: number; totalLoss: number; downtime: number }>);

  const sortedFaultTypes = Object.entries(faultTypeCosts)
    .sort(([, a], [, b]) => b.totalLoss - a.totalLoss)
    .slice(0, 5);

  const handleExportPDF = () => {
    exportCostAnalysisToPDF({
      totalDowntime: totalDowntimeHours,
      dailyLoss: dailyRevenueLoss,
      monthlyLoss: monthlyRevenueLoss,
      avgSessionValue,
      avgSessionsPerDay,
      faultTypeCosts: sortedFaultTypes,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Cost Analysis</h1>
          <p className="text-muted-foreground mt-0.5 text-[13px]">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No Data Available</h3>
            <p className="text-[13px] text-muted-foreground text-center">
              Upload charger logs from the Dashboard Home to view cost analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cost Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-value" className="text-[13px]">Average Session Value (₹)</Label>
                  <Input
                    id="session-value"
                    type="number"
                    value={avgSessionValue}
                    onChange={(e) => setAvgSessionValue(Number(e.target.value))}
                    min="0"
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">Average revenue per charging session</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessions-per-day" className="text-[13px]">Average Sessions per Day</Label>
                  <Input
                    id="sessions-per-day"
                    type="number"
                    value={avgSessionsPerDay}
                    onChange={(e) => setAvgSessionsPerDay(Number(e.target.value))}
                    min="0"
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">Expected daily charging sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Loss Summary */}
          <div className="grid gap-3 md:grid-cols-3">
            <Card className="py-4">
              <CardContent className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Downtime</p>
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight">{totalDowntimeHours.toFixed(1)}h</p>
                <p className="text-[11px] text-muted-foreground">Cumulative charger downtime</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardContent className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Daily Revenue Loss</p>
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-destructive">
                  ₹{dailyRevenueLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[11px] text-muted-foreground">Estimated loss today</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardContent className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Monthly Revenue Loss</p>
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-destructive">
                  ₹{monthlyRevenueLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[11px] text-muted-foreground">Projected monthly impact</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5 Costliest Fault Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedFaultTypes.map(([faultType, data], index) => (
                  <div key={faultType} className="border border-border/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-bold text-muted-foreground/40 tabular-nums">#{index + 1}</span>
                          <h3 className="font-semibold text-[15px]">{faultType}</h3>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-0.5 ml-[30px]">
                          {data.count} occurrence{data.count !== 1 ? 's' : ''} · {data.downtime.toFixed(1)}h downtime
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive tabular-nums">
                          ₹{data.totalLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue loss</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive/70 rounded-full transition-all duration-500"
                        style={{ width: `${(data.totalLoss / sortedFaultTypes[0][1].totalLoss) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}

                {sortedFaultTypes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[13px] text-muted-foreground">No cost data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="bg-primary/5 border-primary/15">
            <CardHeader>
              <CardTitle className="text-base">Financial Impact Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-muted-foreground">Total Faults Detected</span>
                  <span className="text-[15px] font-semibold tabular-nums">{globalParsedLogsData.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-muted-foreground">Total Downtime</span>
                  <span className="text-[15px] font-semibold tabular-nums">{totalDowntimeHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-muted-foreground">Average Loss per Fault</span>
                  <span className="text-[15px] font-semibold tabular-nums">
                    ₹{(dailyRevenueLoss / globalParsedLogsData.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="border-t border-primary/15 pt-2.5 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-semibold">Estimated Monthly Loss</span>
                    <span className="text-xl font-bold text-destructive tabular-nums">
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
