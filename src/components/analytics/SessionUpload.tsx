import { useCallback, useState } from 'react';
import { Upload, FileText, Sparkles, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PurchaseDialog } from '@/components/ui/PurchaseDialog';

interface SessionUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function SessionUpload({ onFileSelect, isProcessing }: SessionUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
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
    setShowPurchaseDialog(true);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setShowPurchaseDialog(true);
  }, []);

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
      <PurchaseDialog 
        open={showPurchaseDialog} 
        onOpenChange={setShowPurchaseDialog} 
      />
      
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive flex items-center justify-center">
              <Lock className="h-3 w-3 text-destructive-foreground" />
            </div>
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
