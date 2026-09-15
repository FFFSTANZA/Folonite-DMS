import { 
  Recommendation, 
  SiteMetrics, 
  ChargerMetrics,
  SessionData 
} from '@/types/analytics';

export function generateRecommendations(
  _sessions: SessionData[],
  siteMetrics: SiteMetrics[],
  chargerMetrics: ChargerMetrics[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let idCounter = 1;

  // Analyze each site
  for (const site of siteMetrics) {
    // High utilization - suggest adding chargers
    if (site.utilizationPercent > 80) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'add_charger',
        severity: 'high',
        siteId: site.siteId,
        title: 'High Demand - Add More Chargers',
        description: `Site ${site.siteId} has ${site.utilizationPercent.toFixed(1)}% utilization, indicating high demand.`,
        impact: `Potential revenue increase of ₹${Math.round(site.totalRevenue * 0.3).toLocaleString('en-IN')} per month`,
        action: 'Install 1-2 additional charging points to capture unmet demand and reduce wait times.',
      });
    }

    // Low utilization - check pricing or location
    if (site.utilizationPercent < 15 && site.sessionsPerDay < 3) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'relocate_charger',
        severity: 'medium',
        siteId: site.siteId,
        title: 'Low Footfall - Consider Relocation',
        description: `Site ${site.siteId} has only ${site.sessionsPerDay.toFixed(1)} sessions/day with ${site.utilizationPercent.toFixed(1)}% utilization.`,
        impact: `Currently losing potential revenue of ₹${Math.round(site.totalRevenue * 2).toLocaleString('en-IN')} per month`,
        action: 'Evaluate site location. Consider moving chargers to higher-traffic areas or improving visibility/signage.',
      });
    }

    // Low average revenue - suggest tariff increase
    if (site.avgSessionRevenue < 100 && site.utilizationPercent > 40) {
      const suggestedIncrease = Math.round((120 - site.avgSessionRevenue) / 10) * 10;
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'increase_tariff',
        severity: 'medium',
        siteId: site.siteId,
        title: 'Optimize Pricing Strategy',
        description: `Site ${site.siteId} has average session revenue of ₹${site.avgSessionRevenue.toFixed(0)}, below market average.`,
        impact: `Potential additional revenue of ₹${Math.round(site.totalSessions * suggestedIncrease).toLocaleString('en-IN')} per month`,
        action: `Increase tariff by ₹${suggestedIncrease} to match local demand. Current utilization suggests customers will accept higher pricing.`,
      });
    }
  }

  // Analyze each charger
  for (const charger of chargerMetrics) {
    // Dead chargers
    if (charger.performance === 'dead') {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'maintenance_needed',
        severity: 'high',
        siteId: charger.siteId,
        chargerId: charger.chargerId,
        title: 'Dead Charger - Immediate Action Required',
        description: `Charger ${charger.chargerId} at ${charger.siteId} has only ${charger.sessionsPerDay.toFixed(1)} sessions/day.`,
        impact: `Revenue loss of ₹${Math.round(charger.totalRevenue * 10).toLocaleString('en-IN')} per month`,
        action: 'Check for hardware faults, connectivity issues, or app listing problems. This charger may be offline or malfunctioning.',
      });
    }

    // Underutilized chargers
    if (charger.performance === 'underutilized') {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'optimize_pricing',
        severity: 'medium',
        siteId: charger.siteId,
        chargerId: charger.chargerId,
        title: 'Underutilized Charger',
        description: `Charger ${charger.chargerId} has ${charger.utilizationPercent.toFixed(1)}% utilization with ${charger.sessionsPerDay.toFixed(1)} sessions/day.`,
        impact: `Potential revenue increase of ₹${Math.round(charger.totalRevenue * 3).toLocaleString('en-IN')} per month`,
        action: 'Review pricing, improve visibility on charging apps, or consider promotional offers to increase usage.',
      });
    }

    // Low energy output - possible grid issue
    if (charger.totalSessions > 10 && charger.totalEnergy / charger.totalSessions < 5) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'check_grid',
        severity: 'high',
        siteId: charger.siteId,
        chargerId: charger.chargerId,
        title: 'Low Energy Output - Grid Issue Suspected',
        description: `Charger ${charger.chargerId} delivers only ${(charger.totalEnergy / charger.totalSessions).toFixed(1)} kWh per session on average.`,
        impact: 'Customer dissatisfaction and potential revenue loss from incomplete charging sessions',
        action: 'Check grid voltage and power supply. May indicate under-voltage issue or power module degradation.',
      });
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
