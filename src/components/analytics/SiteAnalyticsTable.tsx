import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SiteMetrics } from '@/types/analytics';

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
        <CardTitle className="text-lg sm:text-xl">Site Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Site ID</TableHead>
                <TableHead className="text-right min-w-[120px]">Revenue</TableHead>
                <TableHead className="text-right min-w-[100px]">Energy (kWh)</TableHead>
                <TableHead className="text-right min-w-[90px]">Sessions</TableHead>
                <TableHead className="text-right min-w-[110px]">Sessions/Day</TableHead>
                <TableHead className="text-right min-w-[110px]">Avg Revenue</TableHead>
                <TableHead className="text-right min-w-[120px]">Utilization</TableHead>
                <TableHead className="text-right min-w-[100px]">Peak Hour</TableHead>
                <TableHead className="text-right min-w-[90px]">Chargers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.siteId}>
                  <TableCell className="font-medium text-xs sm:text-sm">{site.siteId}</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    <div className="flex items-center justify-end gap-1">
                      {site.totalRevenue >= 10000 ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      ₹{site.totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {site.totalEnergy.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {site.totalSessions}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {site.sessionsPerDay.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    ₹{site.avgSessionRevenue.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {site.utilizationPercent.toFixed(1)}%
                      {getUtilizationBadge(site.utilizationPercent)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
                    {site.peakHour}:00
                  </TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">
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
