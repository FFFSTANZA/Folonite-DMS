import { FileText, Sparkles, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SessionUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function SessionUpload({ onFileSelect, isProcessing }: SessionUploadProps) {
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
      const response = await fetch('/sample-sessions.csv');
      const blob = await response.blob();
      const file = new File([blob], 'sample-sessions.csv', { type: 'text/csv' });
      
      toast({
        title: 'Sample Data Loaded',
        description: 'Loading Indian charging station session data...',
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
          <div className="mb-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Upload Session Data
          </h3>
          
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            Upload CSV or JSON file containing charging session data with fields: siteId, chargerId, connectorId, energy_kWh, sessionDurationMin, tariffINR, revenueINR, startTime, stopTime
          </p>

          <input
            id="session-upload"
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={handleFileInput}
            disabled={isProcessing}
          />

          <Button
            onClick={() => document.getElementById('session-upload')?.click()}
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

          <Button
            variant="outline"
            onClick={handleLoadSample}
            disabled={isProcessing}
            className="border-primary/50 hover:bg-primary/5"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Try Sample Data
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: CSV, JSON
          </p>
        </CardContent>
      </Card>
    </>
  );
}
