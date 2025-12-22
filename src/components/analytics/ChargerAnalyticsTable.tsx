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
        <CardTitle className="text-lg sm:text-xl">Charger Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Site ID</TableHead>
                <TableHead className="min-w-[100px]">Charger ID</TableHead>
                <TableHead className="text-right min-w-[100px]">Revenue</TableHead>
                <TableHead className="text-right min-w-[100px]">Energy (kWh)</TableHead>
                <TableHead className="text-right min-w-[90px]">Sessions</TableHead>
                <TableHead className="text-right min-w-[110px]">Sessions/Day</TableHead>
                <TableHead className="text-right min-w-[110px]">Avg Revenue</TableHead>
                <TableHead className="text-right min-w-[100px]">Utilization</TableHead>
                <TableHead className="min-w-[120px]">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chargers.map((charger) => (
                <TableRow key={`${charger.siteId}-${charger.chargerId}`}>
                  <TableCell className="font-medium text-xs sm:text-sm">{charger.siteId}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{charger.chargerId}</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    ₹{charger.totalRevenue.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {charger.totalEnergy.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {charger.totalSessions}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {charger.sessionsPerDay.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    ₹{charger.avgSessionRevenue.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
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
