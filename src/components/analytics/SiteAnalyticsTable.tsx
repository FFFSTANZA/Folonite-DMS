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
import { SiteMetrics } from '@/types/analytics';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SiteAnalyticsTableProps {
  sites: SiteMetrics[];
}

export function SiteAnalyticsTable({ sites }: SiteAnalyticsTableProps) {
  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 60) {
      return <Badge className="bg-primary">High</Badge>;
    }
    if (utilization >= 30) {
      return <Badge className="bg-muted">Medium</Badge>;
    }
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site ID</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Energy (kWh)</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Sessions/Day</TableHead>
                <TableHead className="text-right">Avg Revenue</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Peak Hour</TableHead>
                <TableHead className="text-right">Chargers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.siteId}>
                  <TableCell className="font-medium">{site.siteId}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {site.totalRevenue >= 10000 ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      ₹{site.totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {site.totalEnergy.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {site.totalSessions}
                  </TableCell>
                  <TableCell className="text-right">
                    {site.sessionsPerDay.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{site.avgSessionRevenue.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {site.utilizationPercent.toFixed(1)}%
                      {getUtilizationBadge(site.utilizationPercent)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {site.peakHour}:00
                  </TableCell>
                  <TableCell className="text-right">
                    {site.chargerCount}
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
