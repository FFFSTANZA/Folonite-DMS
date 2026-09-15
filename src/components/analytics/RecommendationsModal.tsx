import { 
  AlertCircle,
  DollarSign, 
  Download,
  FileText, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Wrench 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recommendation } from '@/types/analytics';
import { exportRecommendationsToCSV, exportRecommendationsToPDF } from '@/utils/exportUtils';

interface RecommendationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: Recommendation[];
  title?: string;
  description?: string;
}

export function RecommendationsModal({ 
  open, 
  onOpenChange, 
  recommendations,
  title = "Business Recommendations",
  description = "Actionable insights to improve your charging station performance"
}: RecommendationsModalProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'increase_tariff':
        return TrendingUp;
      case 'relocate_charger':
        return MapPin;
      case 'add_charger':
        return Plus;
      case 'check_grid':
        return AlertCircle;
      case 'maintenance_needed':
        return Wrench;
      case 'optimize_pricing':
        return DollarSign;
      default:
        return AlertCircle;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const handleExportPDF = () => {
    exportRecommendationsToPDF(recommendations);
  };

  const handleExportCSV = () => {
    exportRecommendationsToCSV(recommendations);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Export Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No recommendations at this time. Your charging stations are performing well!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const Icon = getIcon(rec.type);
              return (
                <div 
                  key={rec.id} 
                  className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-semibold text-lg">{rec.title}</h4>
                        {getSeverityBadge(rec.severity)}
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Site:</span> {rec.siteId}
                          {rec.chargerId && (
                            <span className="ml-3">
                              <span className="font-medium">Charger:</span> {rec.chargerId}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Issue:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>{rec.description}</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Impact:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>{rec.impact}</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Recommended Action:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>{rec.action}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
