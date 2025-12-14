import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/fault/FileUpload';
import { FaultSummary } from '@/components/fault/FaultSummary';
import { FaultTable } from '@/components/fault/FaultTable';
import { CostAnalysis } from '@/components/fault/CostAnalysis';
import { ExportButtons } from '@/components/fault/ExportButtons';
import { RiskSummaryPanel } from '@/components/predictive/RiskSummaryPanel';
import { PredictiveAlerts } from '@/components/predictive/PredictiveAlerts';
import { ChargerHealthScore } from '@/components/predictive/ChargerHealthScore';
import { useToast } from '@/hooks/use-toast';
import { parseLogFile } from '@/utils/logParser';
import { classifyFaults } from '@/utils/faultClassifier';
import { calculateCostAnalysis } from '@/utils/costCalculator';
import { detectPredictiveAlerts, calculateChargerHealth, calculatePredictiveSummary } from '@/utils/patternDetector';
import type { FaultAnalysis, CostParameters, CostAnalysis as CostAnalysisType } from '@/types/fault';
import type { PredictiveAlert, ChargerHealth, PredictiveSummary } from '@/types/predictive';

export default function Dashboard() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [faults, setFaults] = useState<FaultAnalysis[]>([]);
  const [costParams, setCostParams] = useState<CostParameters>({
    avgSessionValue: 120,
    avgSessionsPerDay: 14
  });
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisType>({
    revenueToday: 0,
    revenueThisMonth: 0,
    topCostliestFaults: []
  });
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [chargerHealth, setChargerHealth] = useState<ChargerHealth[]>([]);
  const [predictiveSummary, setPredictiveSummary] = useState<PredictiveSummary>({
    totalChargers: 0,
    atRiskChargers: 0,
    criticalAlerts: 0,
    highRiskAlerts: 0,
    mediumRiskAlerts: 0,
    totalEstimatedLoss: 0,
    averageHealthScore: 100
  });

  const { toast } = useToast();

  // Determine active tab based on route
  const getActiveTab = () => {
    if (location.pathname === '/cost-analysis') return 'faults';
    if (location.pathname === '/predictive') return 'predictive';
    return 'faults'; // default for /fault-diagnosis
  };

  // Update predictive analysis when faults or cost params change
  useEffect(() => {
    if (faults.length > 0) {
      const alerts = detectPredictiveAlerts(faults, costParams.avgSessionValue, costParams.avgSessionsPerDay);
      const health = calculateChargerHealth(faults);
      const summary = calculatePredictiveSummary(alerts, health);
      
      setPredictiveAlerts(alerts);
      setChargerHealth(health);
      setPredictiveSummary(summary);
    }
  }, [faults, costParams]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);

    try {
      const logEntries = await parseLogFile(file);

      if (logEntries.length === 0) {
        toast({
          title: 'No Faults Detected',
          description: 'The log file does not contain any recognizable fault entries.',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      const detectedFaults = classifyFaults(logEntries);

      if (detectedFaults.length === 0) {
        toast({
          title: 'No Faults Classified',
          description: 'No faults could be classified from the log entries.',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      const analysis = calculateCostAnalysis(detectedFaults, costParams);

      setFaults(detectedFaults);
      setCostAnalysis(analysis);

      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed ${detectedFaults.length} fault${detectedFaults.length !== 1 ? 's' : ''} from ${file.name}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the log file. Please check the file format.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCostParamsChange = (newParams: CostParameters) => {
    setCostParams(newParams);
    if (faults.length > 0) {
      const analysis = calculateCostAnalysis(faults, newParams);
      setCostAnalysis(analysis);
    }
  };

  const highSeverityCount = faults.filter(f => f.severity === 'High').length;
  const mediumSeverityCount = faults.filter(f => f.severity === 'Medium').length;
  const lowSeverityCount = faults.filter(f => f.severity === 'Low').length;

  // Page title based on route
  const getPageTitle = () => {
    if (location.pathname === '/cost-analysis') return 'Cost Analysis';
    if (location.pathname === '/predictive') return 'Predictive Failure Indicator';
    return 'Fault Diagnosis';
  };

  const getPageDescription = () => {
    if (location.pathname === '/cost-analysis') return 'Calculate revenue loss from charger downtime';
    if (location.pathname === '/predictive') return 'Identify at-risk chargers before failure';
    return 'Analyze charger failures and errors';
  };

  return (
    <div className="space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
      </div>

      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Upload Log File</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start by uploading your charger logs or try our sample data
            </p>
          </div>
        </div>
        <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      </section>

      {faults.length > 0 && (
        <Tabs value={getActiveTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faults">Fault Analysis</TabsTrigger>
            <TabsTrigger value="predictive">
              Predictive Alerts
              {predictiveAlerts.length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {predictiveAlerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="health">Charger Health</TabsTrigger>
          </TabsList>

          <TabsContent value="faults" className="space-y-8 mt-6 ">
            <section>
              <h2 className="text-xl font-semibold mb-4">Fault Summary</h2>
              <FaultSummary
                totalFaults={faults.length}
                highSeverity={highSeverityCount}
                mediumSeverity={mediumSeverityCount}
                lowSeverity={lowSeverityCount}
              />
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Cost Analysis</h2>
              <CostAnalysis
                costAnalysis={costAnalysis}
                costParams={costParams}
                onCostParamsChange={handleCostParamsChange}
              />
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Detailed Analysis</h2>
              <FaultTable faults={faults} />
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Export</h2>
              <ExportButtons
                faults={faults}
                costAnalysis={costAnalysis}
                costParams={costParams}
              />
            </section>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6 mt-6 ">
            <section>
              <h2 className="text-xl font-semibold mb-4">Risk Overview</h2>
              <RiskSummaryPanel summary={predictiveSummary} />
            </section>

            <section>
              <PredictiveAlerts alerts={predictiveAlerts} />
            </section>
          </TabsContent>

          <TabsContent value="health" className="space-y-6 mt-6 ">
            <section>
              <h2 className="text-xl font-semibold mb-4">Risk Overview</h2>
              <RiskSummaryPanel summary={predictiveSummary} />
            </section>

            <section>
              <ChargerHealthScore healthData={chargerHealth} />
            </section>
          </TabsContent>
        </Tabs>
      )}

      {!isProcessing && faults.length === 0 && (
        <div className="text-center py-12 ">
          <p className="text-muted-foreground">
            Upload a log file to begin analysis
          </p>
        </div>
      )}
    </div>
  );
}
