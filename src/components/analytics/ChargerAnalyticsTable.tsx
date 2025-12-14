import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChargerMetrics } from '@/types/analytics';

interface ChargerAnalyticsTableProps {
  chargers: ChargerMetrics[];
}

export function ChargerAnalyticsTable({ chargers }: ChargerAnalyticsTableProps) {
  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'good':
        return <Badge className="bg-primary">Good</Badge>;
      case 'low':
        return <Badge className="bg-muted">Low</Badge>;
      case 'dead':
        return <Badge variant="destructive">Dead</Badge>;
      case 'underutilized':
        return <Badge className="bg-orange-600">Underutilized</Badge>;
      default:
        return <Badge variant="secondary">{performance}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charger Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site ID</TableHead>
                <TableHead>Charger ID</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Energy (kWh)</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Sessions/Day</TableHead>
                <TableHead className="text-right">Avg Revenue</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chargers.map((charger) => (
                <TableRow key={`${charger.siteId}-${charger.chargerId}`}>
                  <TableCell className="font-medium">{charger.siteId}</TableCell>
                  <TableCell>{charger.chargerId}</TableCell>
                  <TableCell className="text-right">
                    ₹{charger.totalRevenue.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {charger.totalEnergy.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {charger.totalSessions}
                  </TableCell>
                  <TableCell className="text-right">
                    {charger.sessionsPerDay.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{charger.avgSessionRevenue.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {charger.utilizationPercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {getPerformanceBadge(charger.performance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
