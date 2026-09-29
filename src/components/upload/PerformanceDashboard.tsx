import { Clock, Copy, FileText, Filter, Layers, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { OptimizationStats } from '@/utils/logOptimizer';

interface PerformanceDashboardProps {
  stats: OptimizationStats;
}

export function PerformanceDashboard({ stats }: PerformanceDashboardProps) {
  const compressionRatio = stats.totalLines > 0 
    ? ((stats.totalLines - stats.cleanedLines) / stats.totalLines * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Smart Optimization Report
        </CardTitle>
        <CardDescription>
          Performance metrics from log optimization engine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Lines */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Lines</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalLines.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Original log entries</p>
          </div>

          {/* Cleaned Lines */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Cleaned Lines</span>
            </div>
            <p className="text-2xl font-bold text-success">{stats.cleanedLines.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">After optimization</p>
          </div>

          {/* Size Reduction */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Size Reduction</span>
            </div>
            <p className="text-2xl font-bold text-primary">{compressionRatio}%</p>
            <p className="text-xs text-muted-foreground">Data compressed</p>
          </div>

          {/* Duplicates Removed */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Duplicates Removed</span>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.duplicatesRemoved.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Redundant entries</p>
          </div>

          {/* Noise Removed */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Noise Removed</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{stats.noiseRemoved.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Heartbeats, spam, etc.</p>
          </div>

          {/* Fault Clusters */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Fault Clusters</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.faultClustersDetected}</p>
            <p className="text-xs text-muted-foreground">Merged repeating faults</p>
          </div>
        </div>

        {/* Processing Time */}
        <div className="mt-6 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Processing Time</span>
          </div>
          <Badge variant="secondary" className="text-base">
            {stats.processingTimeMs < 1000 
              ? `${stats.processingTimeMs}ms`
              : `${(stats.processingTimeMs / 1000).toFixed(2)}s`}
          </Badge>
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">Optimization Summary:</span> Processed{' '}
            <span className="font-bold text-primary">{stats.totalLines.toLocaleString()}</span> lines,
            removed <span className="font-bold text-destructive">{(stats.duplicatesRemoved + stats.noiseRemoved).toLocaleString()}</span> unnecessary
            entries ({compressionRatio}% reduction), and detected{' '}
            <span className="font-bold text-primary">{stats.faultClustersDetected}</span> fault
            clusters for better analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
