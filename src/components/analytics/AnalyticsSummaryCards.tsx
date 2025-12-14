import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Zap, IndianRupee, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { AnalyticsSummary } from '@/types/analytics';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Sites',
      value: summary.totalSites,
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Total Chargers',
      value: summary.totalChargers,
      icon: Zap,
      color: 'text-muted-foreground',
    },
    {
      title: 'Total Revenue',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-primary',
    },
    {
      title: 'Total Energy',
      value: `${summary.totalEnergy.toFixed(0)} kWh`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Utilization',
      value: `${summary.avgUtilization.toFixed(1)}%`,
      icon: Activity,
      color: 'text-cyan-600',
    },
    {
      title: 'Issues',
      value: `${summary.deadChargers + summary.underutilizedChargers}`,
      icon: AlertTriangle,
      color: 'text-destructive',
      subtitle: `${summary.deadChargers} dead, ${summary.underutilizedChargers} underutilized`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
