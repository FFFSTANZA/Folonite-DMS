import { CheckCircle2, FileText, Filter, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { ChunkProgress } from '@/utils/chunkReader';
import { formatBytes, formatTime } from '@/utils/chunkReader';

interface OptimizationProgressProps {
  open: boolean;
  progress: ChunkProgress;
}

const STAGE_INFO = {
  preparing: {
    label: 'Preparing Log',
    icon: FileText,
    color: 'text-primary',
  },
  reading: {
    label: 'Reading File',
    icon: FileText,
    color: 'text-primary',
  },
  processing: {
    label: 'Processing Lines',
    icon: Loader2,
    color: 'text-primary',
  },
  classifying: {
    label: 'Classifying Faults',
    icon: Filter,
    color: 'text-warning',
  },
  optimizing: {
    label: 'Optimizing Report',
    icon: Zap,
    color: 'text-success',
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    color: 'text-success',
  },
};

export function OptimizationProgress({ open, progress }: OptimizationProgressProps) {
  const stageInfo = STAGE_INFO[progress.stage];
  const Icon = stageInfo.icon;

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${stageInfo.color} ${progress.stage === 'processing' ? 'animate-spin' : ''}`} />
            {stageInfo.label}
          </DialogTitle>
          <DialogDescription>
            Processing large log file with smart optimization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{progress.percentComplete}%</span>
            </div>
            <Progress value={progress.percentComplete} className="h-3" />
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(STAGE_INFO).map(([key, info]) => {
              const isActive = progress.stage === key;
              const isPast = Object.keys(STAGE_INFO).indexOf(key) < Object.keys(STAGE_INFO).indexOf(progress.stage);
              const StageIcon = info.icon;

              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 
                    isPast ? 'bg-muted' : 'bg-background'
                  }`}
                >
                  <StageIcon 
                    className={`h-4 w-4 ${
                      isActive ? info.color : 
                      isPast ? 'text-success' : 'text-muted-foreground'
                    } ${isActive && key === 'processing' ? 'animate-spin' : ''}`}
                  />
                  <span className={`text-xs text-center ${
                    isActive ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    {info.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Chunks Processed</p>
              <p className="text-lg font-semibold">
                {progress.currentChunk} / {progress.totalChunks}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lines Processed</p>
              <p className="text-lg font-semibold">
                {progress.linesProcessed.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Data Processed</p>
              <p className="text-lg font-semibold">
                {formatBytes(progress.bytesProcessed)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Time Remaining</p>
              <p className="text-lg font-semibold">
                {progress.estimatedTimeRemainingMs > 0 
                  ? formatTime(progress.estimatedTimeRemainingMs)
                  : 'Calculating...'}
              </p>
            </div>
          </div>

          {/* File Size Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total File Size</span>
            </div>
            <Badge variant="secondary">
              {formatBytes(progress.totalBytes)}
            </Badge>
          </div>

          {/* Current Stage Description */}
          <div className="text-center text-sm text-muted-foreground">
            {progress.stage === 'preparing' && 'Initializing file reader...'}
            {progress.stage === 'reading' && 'Reading file in chunks to prevent memory overflow...'}
            {progress.stage === 'processing' && 'Parsing log entries and removing noise...'}
            {progress.stage === 'classifying' && 'Detecting and categorizing faults...'}
            {progress.stage === 'optimizing' && 'Compressing data and generating report...'}
            {progress.stage === 'complete' && 'Processing complete! Loading results...'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
