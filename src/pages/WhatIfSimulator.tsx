import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Info,
  Play,
  RotateCcw,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useGlobalData } from '@/context/DataContext';
import {
  DEFAULT_SCENARIOS,
  getUniqueChargerIds,
  runSimulation,
  type SimulationResult,
  type SimulationScenario,
} from '@/utils/whatIfSimulator';

export default function WhatIfSimulator() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();

  const chargerIds = useMemo(
    () => getUniqueChargerIds(globalParsedLogsData),
    [globalParsedLogsData],
  );

  const [selectedCharger, setSelectedCharger] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('current');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [scenario, setScenario] = useState<SimulationScenario>(DEFAULT_SCENARIOS[0]);

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPreset(presetId);
    const preset = DEFAULT_SCENARIOS.find((s) => s.id === presetId);
    if (preset) setScenario({ ...preset });
  }, []);

  const handleSliderChange = useCallback(
    (field: keyof SimulationScenario, value: number) => {
      setSelectedPreset('custom');
      setScenario((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleRunSimulation = useCallback(() => {
    if (!selectedCharger) return;
    setIsRunning(true);
    setTimeout(() => {
      const simResult = runSimulation(globalParsedLogsData, selectedCharger, scenario);
      setResult(simResult);
      setIsRunning(false);
    }, 400);
  }, [selectedCharger, scenario, globalParsedLogsData]);

  const handleReset = useCallback(() => {
    setResult(null);
    setSelectedPreset('current');
    setScenario(DEFAULT_SCENARIOS[0]);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">What-If Simulator</h1>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          Project charger health under different maintenance and environmental scenarios
        </p>
      </div>

      {!isProcessed ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No Data Available</h3>
            <p className="text-[13px] text-muted-foreground text-center">
              Upload charger logs from the Dashboard Home to run simulations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Panel — Controls */}
          <div className="lg:col-span-1 space-y-3">
            {/* Charger Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Select Charger</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCharger} onValueChange={setSelectedCharger}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choose a charger" />
                  </SelectTrigger>
                  <SelectContent>
                    {chargerIds.map((id) => (
                      <SelectItem key={id} value={id}>{id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Scenario Presets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Scenario</CardTitle>
                <CardDescription className="text-[11px]">
                  Pick a preset or customize below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEFAULT_SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handlePresetChange(s.id)}
                      className={`text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 border ${
                        selectedPreset === s.id
                          ? 'border-primary/30 bg-primary/5 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.08)]'
                          : 'border-border/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                  {selectedPreset === 'custom' && (
                    <div className="px-3 py-2 rounded-lg text-[12px] font-medium border border-primary/30 bg-primary/5 text-primary">
                      Custom Configuration
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fine-Tune Controls */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Fine-Tune Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Fault Frequency"
                  value={scenario.faultFrequencyMultiplier}
                  min={0.1} max={3.0} step={0.1} unit="x"
                  onChange={(v) => handleSliderChange('faultFrequencyMultiplier', v)}
                  description="Multiplier on historical fault rate"
                />
                <SliderControl
                  label="Severity Escalation"
                  value={scenario.severityEscalationRate}
                  min={0} max={1} step={0.05} unit=""
                  onChange={(v) => handleSliderChange('severityEscalationRate', v)}
                  description="How fast faults escalate in severity"
                />
                <SliderControl
                  label="Maintenance Interval"
                  value={scenario.maintenanceIntervalDays}
                  min={7} max={90} step={1} unit=" days"
                  onChange={(v) => handleSliderChange('maintenanceIntervalDays', v)}
                  description="Days between maintenance visits"
                />
                <SliderControl
                  label="Heat Stress"
                  value={scenario.temperatureDegradation}
                  min={0} max={2} step={0.1} unit=""
                  onChange={(v) => handleSliderChange('temperatureDegradation', v)}
                  description="Extra faults from high temperatures"
                />
                <SliderControl
                  label="Grid Stability"
                  value={scenario.gridStabilityFactor}
                  min={0.3} max={1.0} step={0.05} unit=""
                  onChange={(v) => handleSliderChange('gridStabilityFactor', v)}
                  description="1.0 = perfectly stable grid"
                />
                <SliderControl
                  label="Network Reliability"
                  value={scenario.networkReliability}
                  min={0.3} max={1.0} step={0.05} unit=""
                  onChange={(v) => handleSliderChange('networkReliability', v)}
                  description="1.0 = always connected"
                />
              </CardContent>
            </Card>

            {/* Run Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleRunSimulation}
                disabled={!selectedCharger || isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Simulating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Run Simulation
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset} size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Panel — Results */}
          <div className="lg:col-span-2 space-y-3">
            {!result ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent>
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-[13px] font-medium">Select a charger and run a simulation</p>
                    <p className="text-[11px] mt-1 opacity-60">
                      Results will appear here with projected health curves
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniMetric label="Current Health" value={`${result.currentHealthScore}/100`}
                    color={result.currentHealthScore >= 70 ? 'text-green-600' : result.currentHealthScore >= 40 ? 'text-amber-600' : 'text-destructive'} />
                  <MiniMetric label="Days to Critical" value={result.daysUntilCritical !== null ? `${result.daysUntilCritical}d` : '90d+'}
                    color={result.daysUntilCritical !== null && result.daysUntilCritical <= 30 ? 'text-destructive' : 'text-amber-600'} />
                  <MiniMetric label="Projected Loss" value={`₹${result.totalProjectedLoss.toLocaleString()}`} color="text-destructive" />
                  <MiniMetric label="Maintenance Cost" value={`₹${result.breakEvenMaintenanceCost.toLocaleString()}`} color="text-green-600" />
                </div>

                {/* Health Projection Chart */}
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[13px] flex items-center gap-2">
                      <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                      90-Day Health Projection
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      {result.scenario.name} — {result.chargerId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.projections}>
                          <defs>
                            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(36, 90%, 50%)" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="hsl(36, 90%, 50%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                            label={{ value: 'Days', position: 'insideBottom', offset: -4, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                            formatter={(value: number, name: string) => [name === 'healthScore' ? `${value}/100` : value, name === 'healthScore' ? 'Health Score' : name]} />
                          <ReferenceLine y={30} stroke="hsl(0, 72%, 51%)" strokeDasharray="4 4" strokeOpacity={0.6}
                            label={{ value: 'Critical', position: 'right', style: { fontSize: 9, fill: 'hsl(0, 72%, 51%)' } }} />
                          <ReferenceLine y={50} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" strokeOpacity={0.6}
                            label={{ value: 'High Risk', position: 'right', style: { fontSize: 9, fill: 'hsl(38, 92%, 50%)' } }} />
                          <Area type="monotone" dataKey="healthScore" stroke="hsl(36, 90%, 50%)" strokeWidth={2} fill="url(#healthGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Loss Projection */}
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[13px] flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      Cumulative Revenue Loss
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.projections}>
                          <defs>
                            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Cumulative Loss']} />
                          <Area type="monotone" dataKey="revenueLoss" stroke="hsl(0, 72%, 51%)" strokeWidth={2} fill="url(#lossGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation */}
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[13px] flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      {result.daysUntilCritical !== null && result.daysUntilCritical <= 30 ? (
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-[13px] leading-relaxed">{result.recommendation}</p>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-[11px] text-muted-foreground">
                        Maintenance cost{' '}
                        <span className="font-semibold text-green-600">₹{result.breakEvenMaintenanceCost.toLocaleString()}</span>{' '}
                        vs projected loss{' '}
                        <span className="font-semibold text-destructive">₹{result.totalProjectedLoss.toLocaleString()}</span>
                      </p>
                      <p className="text-[11px] font-medium mt-1">
                        Potential savings:{' '}
                        <span className="text-green-600">
                          ₹{(result.totalProjectedLoss - result.breakEvenMaintenanceCost).toLocaleString()}{' '}
                          ({Math.round(((result.totalProjectedLoss - result.breakEvenMaintenanceCost) / Math.max(1, result.totalProjectedLoss)) * 100)}%)
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function SliderControl({ label, value, min, max, step, unit, onChange, description }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; description?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <span className="text-[11px] font-semibold tabular-nums text-foreground/80">
          {Number.isInteger(value) ? value : value.toFixed(1)}{unit}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="w-full" />
      {description && <p className="text-[10px] text-muted-foreground/50 leading-tight">{description}</p>}
    </div>
  );
}

function MiniMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="py-3">
      <CardContent className="space-y-0.5">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
