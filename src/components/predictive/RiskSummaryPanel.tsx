import { Activity, AlertTriangle, Shield, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PredictiveSummary } from '@/types/predictive';

interface RiskSummaryPanelProps {
  summary: PredictiveSummary;
}

export function RiskSummaryPanel({ summary }: RiskSummaryPanelProps) {
  const cards = [
    {
      title: 'Total Chargers',
      value: summary.totalChargers,
      icon: Activity,
      color: 'text-primary'
    },
    {
      title: 'At Risk',
      value: summary.atRiskChargers,
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      title: 'Critical Alerts',
      value: summary.criticalAlerts,
      icon: AlertTriangle,
      color: 'text-destructive'
    },
    {
      title: 'Avg Health Score',
      value: `${summary.averageHealthScore}%`,
      icon: Shield,
      color: summary.averageHealthScore >= 80 ? 'text-success' : summary.averageHealthScore >= 60 ? 'text-warning' : 'text-destructive'
    },
    {
      title: 'Est. Revenue at Risk',
      value: `₹${summary.totalEstimatedLoss.toLocaleString('en-IN')}`,
      icon: TrendingDown,
      color: 'text-destructive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
