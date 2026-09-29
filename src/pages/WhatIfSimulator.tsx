import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  IndianRupee,
  Info,
  Layers,
  Play,
  RotateCcw,
  Settings2,
  ShieldAlert,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalData } from '@/context/DataContext';
import { exportScenarioComparisonCSV, exportSimulationPDF } from '@/utils/exportUtils';
import {
  DEFAULT_ECONOMICS,
  DEFAULT_SCENARIOS,
  formatINR,
  getUniqueChargerIds,
  HORIZON_CHOICES,
  runScenarioComparison,
  runSensitivityAnalysis,
  SCENARIO_BOUNDS,
  type ScenarioComparison,
  type ScenarioComparisonRow,
  type SensitivityItem,
  type SimulationEconomics,
  type SimulationScenario,
} from '@/utils/whatIfSimulator';

const SERIES_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];

const PARAM_ORDER: Array<keyof Omit<SimulationScenario, 'id' | 'name'>> = [
  'faultFrequencyMultiplier',
  'severityEscalationRate',
  'maintenanceIntervalDays',
  'temperatureDegradation',
  'gridStabilityFactor',
  'networkReliability',
];

const PARAM_UI: Record<keyof Omit<SimulationScenario, 'id' | 'name'>, { label: string; description: string; unit: string }> = {
  faultFrequencyMultiplier: { label: 'Fault Frequency', unit: 'x', description: 'Multiplier on the charger’s historical fault rate' },
  severityEscalationRate: { label: 'Severity Escalation', unit: '', description: 'How quickly faults worsen over time' },
  maintenanceIntervalDays: { label: 'Maintenance Interval', unit: ' days', description: 'Days between preventive maintenance visits' },
  temperatureDegradation: { label: 'Heat Stress', unit: '', description: 'Cumulative wear from high ambient temperature' },
  gridStabilityFactor: { label: 'Grid Stability', unit: '', description: '1.0 = perfectly stable grid supply' },
  networkReliability: { label: 'Network Reliability', unit: '', description: '1.0 = OCPP link always connected' },
};

export default function WhatIfSimulator() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();

  const chargerIds = useMemo(
    () => getUniqueChargerIds(globalParsedLogsData),
    [globalParsedLogsData],
  );

  const [selectedCharger, setSelectedCharger] = useState('');
  const [horizon, setHorizon] = useState<number>(90);
  const [economics, setEconomics] = useState<SimulationEconomics>(DEFAULT_ECONOMICS);
  const [scenario, setScenario] = useState<SimulationScenario>({ ...DEFAULT_SCENARIOS[0] });
  const [selectedPreset, setSelectedPreset] = useState('current');
  const [isRunning, setIsRunning] = useState(false);
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityItem[]>([]);
  const [focusScenarioId, setFocusScenarioId] = useState('current');
  const [activeTab, setActiveTab] = useState('comparison');
  const [lastRunSignature, setLastRunSignature] = useState<string | null>(null);

  // Auto-pick the first charger so the tool is usable immediately
  useEffect(() => {
    if (!selectedCharger && chargerIds.length > 0) {
      setSelectedCharger(chargerIds[0]);
    }
  }, [chargerIds, selectedCharger]);

  const scenariosToRun = useMemo(() => {
    if (selectedPreset !== 'custom') return DEFAULT_SCENARIOS;
    return [
      ...DEFAULT_SCENARIOS,
      { ...scenario, id: 'custom', name: 'Custom Scenario' },
    ];
  }, [selectedPreset, scenario]);

  const runSignature = useMemo(
    () => JSON.stringify({ selectedCharger, horizon, economics, scenario, selectedPreset }),
    [selectedCharger, horizon, economics, scenario, selectedPreset],
  );

  const isStale = comparison !== null && lastRunSignature !== null && lastRunSignature !== runSignature;

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPreset(presetId);
    const preset = DEFAULT_SCENARIOS.find((s) => s.id === presetId);
    if (preset) setScenario({ ...preset });
  }, []);

  const handleSliderChange = useCallback((field: keyof SimulationScenario, value: number) => {
    setSelectedPreset('custom');
    setScenario((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRunSimulation = useCallback(() => {
    if (!selectedCharger) return;
    setIsRunning(true);
    // Defer so the button can paint its loading state before the crunch
    window.setTimeout(() => {
      const options = { horizonDays: horizon, economics };
      const result = runScenarioComparison(globalParsedLogsData, selectedCharger, options, scenariosToRun);
      const sens = result
        ? runSensitivityAnalysis(globalParsedLogsData, selectedCharger, scenario, options)
        : [];

      setComparison(result);
      setSensitivity(sens);
      if (result) {
        setFocusScenarioId(
          selectedPreset === 'custom'
            ? 'custom'
            : result.rows.find((r) => r.isBest)?.scenario.id ?? result.baselineId,
        );
        setLastRunSignature(runSignature);
        setActiveTab('comparison');
      } else {
        setLastRunSignature(null);
      }
      setIsRunning(false);
    }, 250);
  }, [selectedCharger, horizon, economics, globalParsedLogsData, scenariosToRun, scenario, selectedPreset, runSignature]);

  const handleReset = useCallback(() => {
    setComparison(null);
    setSensitivity([]);
    setLastRunSignature(null);
    setSelectedPreset('current');
    setScenario({ ...DEFAULT_SCENARIOS[0] });
    setHorizon(90);
    setEconomics(DEFAULT_ECONOMICS);
    setActiveTab('comparison');
  }, []);

  const focusRow: ScenarioComparisonRow | null = useMemo(() => {
    if (!comparison) return null;
    return (
      comparison.rows.find((r) => r.scenario.id === focusScenarioId) ??
      comparison.rows.find((r) => r.isBest) ??
      comparison.rows[0]
    );
  }, [comparison, focusScenarioId]);

  const baselineRow = useMemo(
    () => comparison?.rows.find((r) => r.isBaseline) ?? null,
    [comparison],
  );

  const colorFor = useCallback(
    (row: ScenarioComparisonRow) => {
      const idx = comparison?.rows.findIndex((r) => r.scenario.id === row.scenario.id) ?? 0;
      return SERIES_COLORS[idx % SERIES_COLORS.length];
    },
    [comparison],
  );

  // One x-axis of days with a health series per scenario
  const overlayData = useMemo(() => {
    if (!comparison) return [];
    const anchor = comparison.rows[0];
    return anchor.projections.map((point, i) => {
      const row: Record<string, number> = { day: point.day };
      for (const r of comparison.rows) {
        row[r.scenario.id] = r.projections[i]?.healthScore ?? 0;
      }
      return row;
    });
  }, [comparison]);

  // Deterministic health path + Monte Carlo median/band for the focused scenario
  const focusChartData = useMemo(() => {
    if (!focusRow) return [];
    const band = focusRow.monteCarlo?.band ?? [];
    return focusRow.projections.map((point, i) => {
      const b = band[i];
      return {
        day: point.day,
        health: point.healthScore,
        p50: b?.p50 ?? point.healthScore,
        range: b ? ([b.p10, b.p90] as [number, number]) : ([point.healthScore, point.healthScore] as [number, number]),
        p10: b?.p10 ?? point.healthScore,
        p90: b?.p90 ?? point.healthScore,
      };
    });
  }, [focusRow]);

  // Cumulative loss: focused scenario vs baseline
  const lossCompareData = useMemo(() => {
    if (!focusRow || !baselineRow) return [];
    return focusRow.projections.map((point, i) => ({
      day: point.day,
      focus: point.cumulativeLoss,
      baseline: baselineRow.projections[i]?.cumulativeLoss ?? 0,
    }));
  }, [focusRow, baselineRow]);

  const sensitivityData = useMemo(
    () => sensitivity.map((item) => ({ ...item, pct: Math.round(item.swingPct * 100) })),
    [sensitivity],
  );

  const hasData = isProcessed && chargerIds.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">What-If Simulator</h1>
          <p className="text-muted-foreground mt-0.5 text-[13px]">
            Stress-test maintenance, grid and environment assumptions — compare scenarios side by side
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!comparison}
            onClick={() => comparison && exportScenarioComparisonCSV(comparison)}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!comparison || !focusRow}
            onClick={() => comparison && focusRow && exportSimulationPDF(comparison, focusRow, sensitivity)}
          >
            <FileText className="h-3.5 w-3.5" />
            PDF Report
          </Button>
        </div>
      </div>

      {!hasData ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
          {/* ── Left panel: controls ── */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Charger &amp; Horizon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="grid grid-cols-4 gap-1.5">
                  {HORIZON_CHOICES.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`rounded-lg border px-1 py-1.5 text-[11px] font-medium transition-all ${
                        horizon === h
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      {h}d
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Business Assumptions
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Drives every rupee figure in the results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Revenue lost per downtime hour"
                  value={economics.revenuePerHour}
                  min={50} max={1000} step={10} unit="/hr"
                  onChange={(v) => setEconomics((prev) => ({ ...prev, revenuePerHour: v }))}
                  description="Your average ₹ earned per charger-hour"
                />
                <SliderControl
                  label="Cost per maintenance visit"
                  value={economics.maintenanceCostPerVisit}
                  min={250} max={10000} step={250} unit=""
                  onChange={(v) => setEconomics((prev) => ({ ...prev, maintenanceCostPerVisit: v }))}
                  description="Technician travel + labour + parts"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px]">Scenario</CardTitle>
                <CardDescription className="text-[11px]">
                  Pick a preset, then fine-tune — custom runs alongside the presets
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
                      Custom Scenario
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] flex items-center gap-1.5">
                  <Settings2 className="h-3.5 w-3.5" />
                  Fine-Tune Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PARAM_ORDER.map((field) => {
                  const ui = PARAM_UI[field];
                  const bounds = SCENARIO_BOUNDS[field];
                  return (
                    <SliderControl
                      key={field}
                      label={ui.label}
                      value={scenario[field]}
                      min={bounds.min}
                      max={bounds.max}
                      step={bounds.step}
                      unit={ui.unit}
                      onChange={(v) => handleSliderChange(field, v)}
                      description={ui.description}
                    />
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={handleRunSimulation}
                disabled={!selectedCharger || isRunning}
                className={`flex-1 ${isStale ? 'ring-2 ring-amber-500/40' : ''}`}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Simulating…
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
            {isStale && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Inputs changed — re-run to refresh results
              </p>
            )}
          </div>

          {/* ── Right panel: results ── */}
          <div className="space-y-3">
            {!comparison ? (
              <Card className="flex items-center justify-center min-h-[400px]">
                <CardContent>
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-[13px] font-medium">Select a charger and run a simulation</p>
                    <p className="text-[11px] mt-1 opacity-60 max-w-xs">
                      You’ll get a side-by-side scenario comparison, uncertainty ranges and a sensitivity ranking
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* KPI strip */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <MiniMetric
                    label="Health Now"
                    value={`${comparison.rows[0].currentHealthScore}/100`}
                    color={comparison.rows[0].currentHealthScore >= 70 ? 'text-green-600' : comparison.rows[0].currentHealthScore >= 40 ? 'text-amber-600' : 'text-destructive'}
                  />
                  <MiniMetric
                    label="Best Health End"
                    value={`${Math.max(...comparison.rows.map((r) => r.finalHealthScore))}/100`}
                    color="text-foreground"
                  />
                  <MiniMetric
                    label="Baseline Loss"
                    value={formatINR(baselineRow?.totalProjectedLoss ?? 0)}
                    color="text-destructive"
                  />
                  <MiniMetric
                    label="Best Net Benefit"
                    value={formatINR(comparison.bestNetBenefit)}
                    color={comparison.bestNetBenefit > 0 ? 'text-green-600' : 'text-amber-600'}
                  />
                  <MiniMetric
                    label="p95 Loss (risk-adjusted)"
                    value={formatINR(focusRow?.monteCarlo?.p95Loss ?? focusRow?.totalProjectedLoss ?? 0)}
                    color="text-destructive"
                  />
                  <MiniMetric
                    label="P(Critical)"
                    value={`${Math.round((focusRow?.monteCarlo?.criticalProbability ?? 0) * 100)}%`}
                    color={(focusRow?.monteCarlo?.criticalProbability ?? 0) >= 0.5 ? 'text-destructive' : 'text-amber-600'}
                  />
                </div>

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
                      {baselineRow?.daysUntilCritical !== null && baselineRow?.daysUntilCritical !== undefined ? (
                        <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-[13px] leading-relaxed">{comparison.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="h-9">
                    <TabsTrigger value="comparison" className="text-[12px]">
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      Compare
                    </TabsTrigger>
                    <TabsTrigger value="projections" className="text-[12px]">
                      <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                      Projections
                    </TabsTrigger>
                    <TabsTrigger value="sensitivity" className="text-[12px]">
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      What Drives It
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Tab 1: scenario comparison ── */}
                  <TabsContent value="comparison" className="space-y-3 mt-3">
                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-[13px]">Scenario Comparison</CardTitle>
                        <CardDescription className="text-[11px]">
                          {comparison.horizonDays}-day horizon for {comparison.chargerId} · baseline = “Current Trend” · ranked by net benefit after maintenance cost
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[11px]">Scenario</TableHead>
                              <TableHead className="text-[11px] text-right">Health End</TableHead>
                              <TableHead className="text-[11px] text-right">Δ Health</TableHead>
                              <TableHead className="text-[11px] text-right">Faults</TableHead>
                              <TableHead className="text-[11px] text-right">Downtime Loss</TableHead>
                              <TableHead className="text-[11px] text-right">Maint. Cost</TableHead>
                              <TableHead className="text-[11px] text-right">Net vs Baseline</TableHead>
                              <TableHead className="text-[11px] text-right">Days→Critical</TableHead>
                              <TableHead className="text-[11px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...comparison.rows]
                              .sort((a, b) => b.netBenefitVsBaseline - a.netBenefitVsBaseline)
                              .map((row) => (
                                <TableRow
                                  key={row.scenario.id}
                                  className={row.isBest ? 'bg-green-500/5 hover:bg-green-500/10' : undefined}
                                >
                                  <TableCell className="text-[12px] font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{ backgroundColor: colorFor(row) }}
                                      />
                                      {row.scenario.name}
                                      {row.isBest && (
                                        <span className="rounded bg-green-600/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                                          BEST
                                        </span>
                                      )}
                                      {row.isBaseline && (
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                          BASE
                                        </span>
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell className={`text-[12px] text-right font-semibold tabular-nums ${
                                    row.finalHealthScore >= 70 ? 'text-green-600' : row.finalHealthScore >= 40 ? 'text-amber-600' : 'text-destructive'
                                  }`}>
                                    {row.finalHealthScore}/100
                                  </TableCell>
                                  <TableCell className={`text-[12px] text-right tabular-nums ${
                                    row.deltaHealthVsBaseline > 0 ? 'text-green-600' : row.deltaHealthVsBaseline < 0 ? 'text-destructive' : 'text-muted-foreground'
                                  }`}>
                                    {row.deltaHealthVsBaseline > 0 ? '+' : ''}{row.deltaHealthVsBaseline}
                                  </TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums">{row.totalProjectedFaults}</TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums text-destructive">
                                    {formatINR(row.totalProjectedLoss)}
                                  </TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums">
                                    {formatINR(row.maintenanceCost)}
                                  </TableCell>
                                  <TableCell className={`text-[12px] text-right font-semibold tabular-nums ${
                                    row.netBenefitVsBaseline > 0 ? 'text-green-600' : row.netBenefitVsBaseline < 0 ? 'text-destructive' : 'text-muted-foreground'
                                  }`}>
                                    {row.netBenefitVsBaseline > 0 ? '+' : ''}{formatINR(row.netBenefitVsBaseline)}
                                  </TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums">
                                    {row.daysUntilCritical !== null ? `${row.daysUntilCritical}d` : '—'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-[11px]"
                                      onClick={() => {
                                        setFocusScenarioId(row.scenario.id);
                                        setActiveTab('projections');
                                      }}
                                    >
                                      Analyze →
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-[13px] flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          Health Trajectory — All Scenarios
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          Higher is healthier · dashed lines mark the High (50) and Critical (30) risk thresholds
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={overlayData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                                label={{ value: 'Days', position: 'insideBottom', offset: -4, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                                formatter={(value: number, name: string) => {
                                  const scenarioName = comparison.rows.find((r) => r.scenario.id === name)?.scenario.name ?? name;
                                  return [`${value}/100`, scenarioName];
                                }}
                                labelFormatter={(label) => `Day ${label}`}
                              />
                              <Legend
                                formatter={(value: string) => {
                                  const scenarioName = comparison.rows.find((r) => r.scenario.id === value)?.scenario.name ?? value;
                                  return <span style={{ fontSize: 11 }}>{scenarioName}</span>;
                                }}
                              />
                              <ReferenceLine y={30} stroke="hsl(0, 72%, 51%)" strokeDasharray="4 4" strokeOpacity={0.6}
                                label={{ value: 'Critical', position: 'right', style: { fontSize: 9, fill: 'hsl(0, 72%, 51%)' } }} />
                              <ReferenceLine y={50} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" strokeOpacity={0.6}
                                label={{ value: 'High Risk', position: 'right', style: { fontSize: 9, fill: 'hsl(38, 92%, 50%)' } }} />
                              {comparison.rows.map((row) => (
                                <Line
                                  key={row.scenario.id}
                                  type="monotone"
                                  dataKey={row.scenario.id}
                                  stroke={colorFor(row)}
                                  strokeWidth={row.isBest ? 2.5 : 1.6}
                                  dot={false}
                                  strokeOpacity={row.isBaseline || row.isBest ? 1 : 0.75}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── Tab 2: focused projections ── */}
                  <TabsContent value="projections" className="space-y-3 mt-3">
                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-[13px]">Focused Scenario</CardTitle>
                        <CardDescription className="text-[11px]">
                          Pick which scenario to drill into
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {comparison.rows.map((row) => (
                            <button
                              key={row.scenario.id}
                              onClick={() => setFocusScenarioId(row.scenario.id)}
                              className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                                focusRow?.scenario.id === row.scenario.id
                                  ? 'border-primary/30 bg-primary/5 text-primary'
                                  : 'border-border/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                              }`}
                            >
                              {row.scenario.name}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {focusRow && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <MiniMetric label="Health End" value={`${focusRow.finalHealthScore}/100`}
                            color={focusRow.finalHealthScore >= 70 ? 'text-green-600' : focusRow.finalHealthScore >= 40 ? 'text-amber-600' : 'text-destructive'} />
                          <MiniMetric label="Expected Loss" value={formatINR(focusRow.monteCarlo?.expectedLoss ?? focusRow.totalProjectedLoss)} color="text-destructive" />
                          <MiniMetric label="p95 Loss" value={formatINR(focusRow.monteCarlo?.p95Loss ?? focusRow.totalProjectedLoss)} color="text-destructive" />
                          <MiniMetric label="Maintenance Visits" value={`${focusRow.maintenanceVisits} × ${formatINR(comparison.economics.maintenanceCostPerVisit)}`} color="text-foreground" />
                        </div>

                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-[13px] flex items-center gap-2">
                              <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                              Health Projection with Uncertainty — {focusRow.scenario.name}
                            </CardTitle>
                            <CardDescription className="text-[11px]">
                              Shaded band = 10th–90th percentile across {focusRow.monteCarlo?.runs ?? 0} Monte Carlo runs · solid line = deterministic path
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={focusChartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                                    label={{ value: 'Days', position: 'insideBottom', offset: -4, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                                    formatter={(value: number, name: string) => {
                                      const labels: Record<string, string> = {
                                        health: 'Deterministic',
                                        p50: 'Median (MC)',
                                        p10: 'P10',
                                        p90: 'P90',
                                      };
                                      return [`${value}/100`, labels[name] ?? name];
                                    }}
                                    labelFormatter={(label) => `Day ${label}`}
                                  />
                                  <ReferenceLine y={30} stroke="hsl(0, 72%, 51%)" strokeDasharray="4 4" strokeOpacity={0.6}
                                    label={{ value: 'Critical', position: 'right', style: { fontSize: 9, fill: 'hsl(0, 72%, 51%)' } }} />
                                  <ReferenceLine y={50} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" strokeOpacity={0.6}
                                    label={{ value: 'High Risk', position: 'right', style: { fontSize: 9, fill: 'hsl(38, 92%, 50%)' } }} />
                                  <Area type="monotone" dataKey="range" stroke="none" fill={colorFor(focusRow)} fillOpacity={0.15} isAnimationActive={false} />
                                  <Line type="monotone" dataKey="p50" stroke={colorFor(focusRow)} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                                  <Line type="monotone" dataKey="health" stroke={colorFor(focusRow)} strokeWidth={2.5} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-[13px] flex items-center gap-2">
                              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                              Cumulative Downtime Loss — {focusRow.scenario.name} vs Baseline
                            </CardTitle>
                            <CardDescription className="text-[11px]">
                              {formatINR(focusRow.totalProjectedLoss)} vs {formatINR(baselineRow?.totalProjectedLoss ?? 0)} baseline over {comparison.horizonDays} days
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lossCompareData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                                    formatter={(value: number, name: string) => [
                                      `₹${Math.round(value).toLocaleString('en-IN')}`,
                                      name === 'focus' ? focusRow.scenario.name : 'Current Trend (baseline)',
                                    ]}
                                    labelFormatter={(label) => `Day ${label}`}
                                  />
                                  <Legend formatter={(value: string) => (
                                    <span style={{ fontSize: 11 }}>
                                      {value === 'focus' ? focusRow.scenario.name : 'Current Trend (baseline)'}
                                    </span>
                                  )} />
                                  <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.8} strokeDasharray="6 4" dot={false} />
                                  <Line type="monotone" dataKey="focus" stroke={colorFor(focusRow)} strokeWidth={2.5} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {focusRow.monteCarlo && (
                          <Card>
                            <CardHeader className="pb-1">
                              <CardTitle className="text-[13px] flex items-center gap-2">
                                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                                Risk Distribution ({focusRow.monteCarlo.runs} simulated futures)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                                <RiskStat label="Best case loss" value={formatINR(focusRow.monteCarlo.bestCaseLoss)} tone="text-green-600" />
                                <RiskStat label="Median loss" value={formatINR(focusRow.monteCarlo.medianLoss)} tone="text-foreground" />
                                <RiskStat label="p95 loss (near-worst)" value={formatINR(focusRow.monteCarlo.p95Loss)} tone="text-destructive" />
                                <RiskStat
                                  label="P(failure within horizon)"
                                  value={`${Math.round(focusRow.monteCarlo.failureProbability * 100)}%`}
                                  tone={focusRow.monteCarlo.failureProbability > 0.3 ? 'text-destructive' : 'text-amber-600'}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </TabsContent>

                  {/* ── Tab 3: sensitivity ── */}
                  <TabsContent value="sensitivity" className="space-y-3 mt-3">
                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="text-[13px] flex items-center gap-2">
                          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                          What Moves the Needle
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          Each lever swung ±20% on “{selectedPreset === 'custom' ? 'Custom Scenario' : scenario.name}” — bigger bar = bigger effect on projected loss
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {sensitivityData.length === 0 ? (
                          <p className="text-[13px] text-muted-foreground py-6 text-center">Run a simulation to see sensitivity results.</p>
                        ) : (
                          <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sensitivityData} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}
                                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '11px', boxShadow: 'var(--shadow-md)' }}
                                  cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.4 }}
                                  formatter={(value: number) => [`${formatINR(value)} swing`, 'Loss impact']}
                                />
                                <Bar dataKey="swing" radius={[0, 6, 6, 0]} maxBarSize={26}>
                                  {sensitivityData.map((item, index) => (
                                    <Cell key={item.key} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                                  ))}
                                  <LabelList
                                    dataKey="pct"
                                    position="right"
                                    formatter={(value: number) => `${value}%`}
                                    style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {sensitivityData.length > 0 && (
                      <Card>
                        <CardHeader className="pb-1">
                          <CardTitle className="text-[13px]">Lever Breakdown</CardTitle>
                          <CardDescription className="text-[11px]">
                            Low/High = projected loss when the lever moves −20% / +20%, everything else held constant
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">Lever</TableHead>
                                <TableHead className="text-[11px] text-right">Loss @ −20%</TableHead>
                                <TableHead className="text-[11px] text-right">Loss @ +20%</TableHead>
                                <TableHead className="text-[11px] text-right">Swing</TableHead>
                                <TableHead className="text-[11px] text-right">Impact</TableHead>
                                <TableHead className="text-[11px]">How to act</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sensitivityData.map((item, index) => (
                                <TableRow key={item.key}>
                                  <TableCell className="text-[12px] font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                                      />
                                      {item.label}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums text-green-600">{formatINR(item.lowLoss)}</TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums text-destructive">{formatINR(item.highLoss)}</TableCell>
                                  <TableCell className="text-[12px] text-right font-semibold tabular-nums">{formatINR(item.swing)}</TableCell>
                                  <TableCell className="text-[12px] text-right tabular-nums">{item.pct}%</TableCell>
                                  <TableCell className="text-[11px] text-muted-foreground">{item.hint}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
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
          {Number.isInteger(value) ? value : value.toFixed(2)}{unit}
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
        <p className={`text-[15px] font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function RiskStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-[15px] font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
