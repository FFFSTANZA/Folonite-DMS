import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, FileText, DollarSign, Loader2, CheckCircle2, Database, Zap, Lock } from 'lucide-react';
import { useGlobalData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, parseJSON, parseTXT } from '@/utils/logParser';
import { classifyFaults } from '@/utils/faultClassifier';
import { parseSessionFile } from '@/utils/sessionParser';
import { calculateSiteMetrics, calculateChargerMetrics } from '@/utils/analyticsEngine';
import { calculateHealthData } from '@/utils/healthCalculator';
import { ChunkReader, type ChunkProgress } from '@/utils/chunkReader';
import { optimizeLogs, type OptimizationStats } from '@/utils/logOptimizer';
import { normalizeLogFile, type NormalizationResult } from '@/utils/logNormalizer';
import { OptimizationProgress } from './OptimizationProgress';
import { PerformanceDashboard } from './PerformanceDashboard';
import { VendorDetectionBanner } from './VendorDetectionBanner';
import { PurchaseDialog } from '@/components/ui/PurchaseDialog';

export function UniversalUpload() {
  const {
    setGlobalParsedLogsData,
    setGlobalParsedRevenueData,
    setSiteMetrics,
    setChargerMetrics,
    setHealthData,
    setIsLogsUploaded,
    setIsRevenueUploaded,
    setIsProcessed,
    isLogsUploaded,
    isRevenueUploaded,
    isProcessed,
    loadSampleData,
  } = useGlobalData();

  const [logsFile, setLogsFile] = useState<File | null>(null);
  const [revenueFile, setRevenueFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useOptimizer, setUseOptimizer] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [progress, setProgress] = useState<ChunkProgress>({
    stage: 'preparing',
    currentChunk: 0,
    totalChunks: 0,
    bytesProcessed: 0,
    totalBytes: 0,
    percentComplete: 0,
    estimatedTimeRemainingMs: 0,
    linesProcessed: 0,
  });
  const [optimizationStats, setOptimizationStats] = useState<OptimizationStats | null>(null);
  const [normalizationResult, setNormalizationResult] = useState<NormalizationResult | null>(null);
  const { toast } = useToast();

  const handleLogsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setShowPurchaseDialog(true);
  };

  const handleRevenueFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setShowPurchaseDialog(true);
  };

  const processLogsWithOptimizer = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB threshold

    // First, perform vendor detection
    const text = await file.text();
    const normalization = await normalizeLogFile(text, file.name);
    setNormalizationResult(normalization);

    // Show vendor detection toast
    toast({
      title: 'Vendor Detected',
      description: `${normalization.banner.vendor} (${normalization.banner.format}) - ${normalization.banner.entriesProcessed} entries normalized`,
    });

    if (isLargeFile && useOptimizer) {
      // Use chunk reader for large files
      setShowProgress(true);

      const reader = new ChunkReader(file, {
        chunkSize: 2 * 1024 * 1024, // 2MB chunks
        onProgress: (prog) => {
          setProgress(prog);
        },
      });

      try {
        // Read all lines
        setProgress(prev => ({ ...prev, stage: 'reading' }));
        const lines = await reader.readInChunks();

        // Parse lines
        setProgress(prev => ({ ...prev, stage: 'processing' }));
        let logEntries;
        if (fileName.endsWith('.csv')) {
          logEntries = parseCSV(lines.join('\n'));
        } else if (fileName.endsWith('.json')) {
          logEntries = parseJSON(lines.join('\n'));
        } else {
          logEntries = parseTXT(lines.join('\n'));
        }

        // Optimize logs
        setProgress(prev => ({ ...prev, stage: 'optimizing' }));
        const optimized = optimizeLogs(logEntries);
        setOptimizationStats(optimized.stats);

        // Classify faults
        setProgress(prev => ({ ...prev, stage: 'classifying' }));
        const faults = classifyFaults(optimized.entries);

        setProgress(prev => ({ ...prev, stage: 'complete' }));

        // Small delay to show complete state
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowProgress(false);

        return faults;
      } catch (error) {
        setShowProgress(false);
        throw error;
      }
    } else {
      // Standard processing for small files
      let logEntries;

      if (fileName.endsWith('.csv')) {
        logEntries = parseCSV(text);
      } else if (fileName.endsWith('.json')) {
        logEntries = parseJSON(text);
      } else {
        logEntries = parseTXT(text);
      }

      if (useOptimizer) {
        const optimized = optimizeLogs(logEntries);
        setOptimizationStats(optimized.stats);
        return classifyFaults(optimized.entries);
      } else {
        return classifyFaults(logEntries);
      }
    }
  };

  const handleProcessAllData = async () => {
    if (!logsFile && !revenueFile) {
      toast({
        title: 'No Files Selected',
        description: 'Please upload at least one file to process',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Parse logs file
      if (logsFile) {
        const faults = await processLogsWithOptimizer(logsFile);
        setGlobalParsedLogsData(faults);
        setIsLogsUploaded(true);

        // Calculate health data from faults
        const health = calculateHealthData(faults);
        setHealthData(health);
      }

      // Parse revenue file
      if (revenueFile) {
        const revenueData = await parseSessionFile(revenueFile);
        setGlobalParsedRevenueData(revenueData);
        setIsRevenueUploaded(true);

        // Calculate site and charger metrics
        const sites = calculateSiteMetrics(revenueData);
        const chargers = calculateChargerMetrics(revenueData);
        setSiteMetrics(sites);
        setChargerMetrics(chargers);
      }

      setIsProcessed(true);

      toast({
        title: 'Data Processed Successfully',
        description: useOptimizer && optimizationStats
          ? `Optimized ${optimizationStats.totalLines} lines to ${optimizationStats.cleanedLines} (${optimizationStats.sizeReductionPercent}% reduction)`
          : 'All modules have been populated with your data',
      });
    } catch (error) {
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Failed to process files',
        variant: 'destructive',
      });
      setIsProcessed(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleData = () => {
    setIsProcessing(true);
    try {
      loadSampleData();
      toast({
        title: 'Sample Data Loaded',
        description: 'All modules populated with sample data',
      });
    } catch (error) {
      toast({
        title: 'Failed to Load Sample Data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <PurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
      <OptimizationProgress open={showProgress} progress={progress} />

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Universal Data Import
          </CardTitle>
          <CardDescription className="py-1">
            Upload your data files once to populate all modules across the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Smart Optimizer Toggle */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Smart Log Optimizer</p>
                <p className="text-xs text-muted-foreground">
                  Remove noise, duplicates, and compress large files (50-300MB)
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Switch
                checked={useOptimizer}
                onCheckedChange={setUseOptimizer}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* File Size Info */}
          {logsFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{logsFile.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({(logsFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </span>
              {logsFile.size > 5 * 1024 * 1024 && (
                <Badge variant="secondary" className="ml-auto">
                  Large File
                </Badge>
              )}
            </div>
          )}

          {/* Upload Zones */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Charger Logs Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Charger Logs
                </label>
                {isLogsUploaded && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Uploaded
                  </Badge>
                )}
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleLogsFileSelect}
                  className="hidden"
                  id="logs-upload"
                />
                <label
                  htmlFor="logs-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="relative">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                      <Lock className="h-3 w-3 text-destructive-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-center">
                    {logsFile ? (
                      <span className="text-primary font-medium">{logsFile.name}</span>
                    ) : (
                      <>
                        <span className="text-primary font-medium">Click to upload</span>
                        <br />
                        <span className="text-muted-foreground">CSV, TXT, or JSON</span>
                      </>
                    )}
                  </p>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                For: Fault Diagnosis, Cost Analysis, Predictive Failure
              </p>
            </div>

            {/* Revenue Data Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Revenue Data
                </label>
                {isRevenueUploaded && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Uploaded
                  </Badge>
                )}
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleRevenueFileSelect}
                  className="hidden"
                  id="revenue-upload"
                />
                <label
                  htmlFor="revenue-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="relative">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                      <Lock className="h-3 w-3 text-destructive-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-center">
                    {revenueFile ? (
                      <span className="text-primary font-medium">{revenueFile.name}</span>
                    ) : (
                      <>
                        <span className="text-primary font-medium">Click to upload</span>
                        <br />
                        <span className="text-muted-foreground">CSV format</span>
                      </>
                    )}
                  </p>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                For: Performance Analytics (Site & Charger views)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleProcessAllData}
              disabled={isProcessing || (!logsFile && !revenueFile)}
              className="flex-1 gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Process All Data
                </>
              )}
            </Button>

            <Button
              onClick={handleLoadSampleData}
              disabled={isProcessing}
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
            >
              <FileText className="h-4 w-4" />
              Load Sample Data
            </Button>
          </div>

          {/* Status Indicator */}
          {isProcessed && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">All modules populated successfully!</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate to any module to view your analyzed data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Detection Banner */}
      {normalizationResult && (
        <div className="mt-6">
          <VendorDetectionBanner
            banner={normalizationResult.banner}
            validationWarnings={normalizationResult.validationSummary.warnings}
          />
        </div>
      )}

      {/* Performance Dashboard */}
      {optimizationStats && (
        <div className="mt-6">
          <PerformanceDashboard stats={optimizationStats} />
        </div>
      )}
    </>
  );
}
