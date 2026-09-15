import { FileText, Sparkles, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleLoadSample = useCallback(async () => {
    try {
      const response = await fetch('/sample-logs.csv');
      const blob = await response.blob();
      const file = new File([blob], 'sample-logs.csv', { type: 'text/csv' });
      
      toast({
        title: 'Sample Data Loaded',
        description: 'Loading Indian EV charging station sample logs...',
      });
      
      onFileSelect(file);
    } catch (error) {
      toast({
        title: 'Failed to Load Sample',
        description: 'Could not load sample data. Please upload your own file.',
        variant: 'destructive'
      });
    }
  }, [onFileSelect, toast]);

  const handleLoadPredictiveSample = useCallback(async () => {
    try {
      const response = await fetch('/sample-logs-predictive.csv');
      const blob = await response.blob();
      const file = new File([blob], 'sample-logs-predictive.csv', { type: 'text/csv' });
      
      toast({
        title: 'Predictive Sample Loaded',
        description: 'Loading sample data with failure patterns for predictive analysis...',
      });
      
      onFileSelect(file);
    } catch (error) {
      toast({
        title: 'Failed to Load Sample',
        description: 'Could not load sample data. Please upload your own file.',
        variant: 'destructive'
      });
    }
  }, [onFileSelect, toast]);

  return (
    <>
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            {isProcessing ? (
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {isProcessing ? 'Processing Log File...' : 'Upload Charger Log File'}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Drag and drop your log file here, or click to browse. Supports CSV, JSON, and TXT formats.
          </p>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.json,.txt,.log"
            onChange={handleFileInput}
            disabled={isProcessing}
          />

          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isProcessing}
          >
            <FileText className="mr-2 h-4 w-4" />
            Select File
          </Button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLoadSample}
              disabled={isProcessing}
              className="border-primary/50 hover:bg-primary/5"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Try Sample Data
            </Button>

            <Button
              variant="outline"
              onClick={handleLoadPredictiveSample}
              disabled={isProcessing}
              className="border-primary/30 hover:bg-primary/5"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Predictive Sample
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: CSV, JSON, TXT
          </p>
        </CardContent>
      </Card>
    </>
  );
}
