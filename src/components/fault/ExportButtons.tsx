import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { CostAnalysis, CostParameters, FaultAnalysis } from '@/types/fault';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';

interface ExportButtonsProps {
  faults: FaultAnalysis[];
  costAnalysis: CostAnalysis;
  costParams: CostParameters;
}

export function ExportButtons({ faults, costAnalysis, costParams }: ExportButtonsProps) {
  const { toast } = useToast();

  const handleExportPDF = () => {
    try {
      exportToPDF(faults, costAnalysis, costParams);
      toast({
        title: 'PDF Exported',
        description: 'Your fault analysis report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report.',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(faults, costParams);
      toast({
        title: 'CSV Exported',
        description: 'Your fault data has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate CSV file.',
        variant: 'destructive'
      });
    }
  };

  if (faults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExportPDF} className="flex-1">
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex-1">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          PDF includes full analysis report. CSV contains detailed fault data for further processing.
        </p>
      </CardContent>
    </Card>
  );
}
