import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recommendation } from '@/types/analytics';
import { 
  TrendingUp, 
  MapPin, 
  Plus, 
  Wrench, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
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
        return <Badge className="bg-muted">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recommendations at this time. Your charging stations are performing well!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = getIcon(rec.type);
            return (
              <Card key={rec.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
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

                      <div className="space-y-3 mt-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Issue:</p>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Impact:</p>
                          <p className="text-sm text-muted-foreground">{rec.impact}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Recommended Action:</p>
                          <p className="text-sm text-muted-foreground">{rec.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
