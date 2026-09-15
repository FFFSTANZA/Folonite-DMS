import type { FaultAnalysis, CostParameters, CostAnalysis, FaultType } from '@/types/fault';

export function calculateRevenueLoss(
  downtime: number,
  costParams: CostParameters
): number {
  const { avgSessionValue, avgSessionsPerDay } = costParams;
  const dailyRevenue = avgSessionValue * avgSessionsPerDay;
  const hourlyRevenue = dailyRevenue / 24;
  return hourlyRevenue * downtime;
}

export function calculateCostAnalysis(
  faults: FaultAnalysis[],
  costParams: CostParameters
): CostAnalysis {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let revenueToday = 0;
  let revenueThisMonth = 0;

  const faultCostMap = new Map<string, { totalCost: number; occurrences: number }>();

  for (const fault of faults) {
    const faultDate = new Date(fault.timestamp);
    const revenueLoss = calculateRevenueLoss(fault.downtime, costParams);

    if (faultDate >= todayStart) {
      revenueToday += revenueLoss;
    }

    if (faultDate >= monthStart) {
      revenueThisMonth += revenueLoss;
    }

    const existing = faultCostMap.get(fault.faultType) || { totalCost: 0, occurrences: 0 };
    faultCostMap.set(fault.faultType, {
      totalCost: existing.totalCost + revenueLoss,
      occurrences: existing.occurrences + 1
    });
  }

  const topCostliestFaults = Array.from(faultCostMap.entries())
    .map(([faultType, data]) => ({
      faultType: faultType as FaultType,
      totalCost: data.totalCost,
      occurrences: data.occurrences
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  return {
    revenueToday,
    revenueThisMonth,
    topCostliestFaults
  };
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
