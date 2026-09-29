import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FaultAnalysis, CostAnalysis, CostParameters } from '@/types/fault';
import type { Recommendation } from '@/types/analytics';
import { formatCurrency } from './costCalculator';
import type {
  ScenarioComparison,
  ScenarioComparisonRow,
  SensitivityItem,
} from './whatIfSimulator';

export function exportToPDF(
  faults: FaultAnalysis[],
  costAnalysis: CostAnalysis,
  costParams: CostParameters
): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('DMS Fault Diagnosis Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(14);
  doc.text('Summary', 14, 40);

  doc.setFontSize(10);
  doc.text(`Total Faults Detected: ${faults.length}`, 14, 48);
  doc.text(`Critical Severity: ${faults.filter(f => f.severity === 'Critical').length}`, 14, 54);
  doc.text(`High Severity: ${faults.filter(f => f.severity === 'High').length}`, 14, 60);
  doc.text(`Medium Severity: ${faults.filter(f => f.severity === 'Medium').length}`, 14, 66);
  doc.text(`Low Severity: ${faults.filter(f => f.severity === 'Low').length}`, 14, 72);

  doc.setFontSize(14);
  doc.text('Revenue Impact', 14, 84);

  doc.setFontSize(10);
  doc.text(`Revenue Lost Today: ${formatCurrency(costAnalysis.revenueToday)}`, 14, 92);
  doc.text(`Revenue Lost This Month: ${formatCurrency(costAnalysis.revenueThisMonth)}`, 14, 98);
  doc.text(`Avg Session Value: ${formatCurrency(costParams.avgSessionValue)}`, 14, 104);
  doc.text(`Avg Sessions/Day: ${costParams.avgSessionsPerDay}`, 14, 110);

  autoTable(doc, {
    startY: 120,
    head: [['Fault Type', 'Timestamp', 'Connector', 'Severity', 'Downtime (hrs)', 'Revenue Loss']],
    body: faults.map(fault => [
      fault.faultType,
      new Date(fault.timestamp).toLocaleString(),
      fault.connectorId,
      fault.severity,
      fault.downtime.toString(),
      formatCurrency((costParams.avgSessionValue * costParams.avgSessionsPerDay / 24) * fault.downtime)
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  let finalY = (doc as any).lastAutoTable.finalY || 115;

  if (finalY > 250) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 10;
  }

  doc.setFontSize(14);
  doc.text('Top 5 Costliest Faults', 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Fault Type', 'Occurrences', 'Total Cost']],
    body: costAnalysis.topCostliestFaults.map(fault => [
      fault.faultType,
      fault.occurrences.toString(),
      formatCurrency(fault.totalCost)
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  doc.save(`folocharge-fault-report-${Date.now()}.pdf`);
}

export function exportToCSV(faults: FaultAnalysis[], costParams: CostParameters): void {
  const headers = [
    'Fault ID',
    'Fault Type',
    'Timestamp',
    'Connector ID',
    'Severity',
    'Description',
    'Root Cause',
    'Impact',
    'Resolution',
    'Downtime (hours)',
    'Revenue Loss (INR)',
    'Error Code',
    'Temperature',
    'Voltage',
    'Current'
  ];

  const rows = faults.map(fault => {
    const revenueLoss = (costParams.avgSessionValue * costParams.avgSessionsPerDay / 24) * fault.downtime;
    return [
      fault.id,
      fault.faultType,
      fault.timestamp,
      fault.connectorId,
      fault.severity,
      fault.description,
      fault.rootCause,
      fault.impact,
      fault.resolution,
      fault.downtime.toString(),
      revenueLoss.toFixed(2),
      fault.logEntry.errorCode || '',
      fault.logEntry.temperature?.toString() || '',
      fault.logEntry.voltage?.toString() || '',
      fault.logEntry.current?.toString() || ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `folocharge-fault-data-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecommendationsToPDF(recommendations: Recommendation[]): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('DMS Business Recommendations', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(14);
  doc.text('Summary', 14, 40);

  doc.setFontSize(10);
  doc.text(`Total Recommendations: ${recommendations.length}`, 14, 48);
  doc.text(`High Priority: ${recommendations.filter(r => r.severity === 'high').length}`, 14, 54);
  doc.text(`Medium Priority: ${recommendations.filter(r => r.severity === 'medium').length}`, 14, 60);
  doc.text(`Low Priority: ${recommendations.filter(r => r.severity === 'low').length}`, 14, 66);

  autoTable(doc, {
    startY: 75,
    head: [['Priority', 'Site', 'Charger', 'Title', 'Issue', 'Impact', 'Action']],
    body: recommendations.map(rec => [
      rec.severity.toUpperCase(),
      rec.siteId,
      rec.chargerId || 'N/A',
      rec.title,
      rec.description,
      rec.impact,
      rec.action
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 }
    }
  });

  doc.save(`folocharge-recommendations-${Date.now()}.pdf`);
}

export function exportRecommendationsToCSV(recommendations: Recommendation[]): void {
  const headers = ['Priority', 'Site', 'Charger', 'Title', 'Issue', 'Impact', 'Recommended Action'];
  const rows = recommendations.map(rec => [
    rec.severity.toUpperCase(),
    rec.siteId,
    rec.chargerId || 'N/A',
    rec.title,
    rec.description,
    rec.impact,
    rec.action
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `folocharge-recommendations-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export function exportFaultsToPDF(faults: FaultAnalysis[]): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('DMS Fault Diagnosis Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(14);
  doc.text('Fault Summary', 14, 40);

  doc.setFontSize(10);
  doc.text(`Total Faults: ${faults.length}`, 14, 48);
  doc.text(`Critical Severity: ${faults.filter(f => f.severity === 'Critical').length}`, 14, 54);
  doc.text(`High Severity: ${faults.filter(f => f.severity === 'High').length}`, 14, 60);
  doc.text(`Medium Severity: ${faults.filter(f => f.severity === 'Medium').length}`, 14, 66);
  doc.text(`Low Severity: ${faults.filter(f => f.severity === 'Low').length}`, 14, 72);

  autoTable(doc, {
    startY: 80,
    head: [['Timestamp', 'Fault Type', 'Connector', 'Severity', 'Description']],
    body: faults.map(f => [
      new Date(f.timestamp).toLocaleString(),
      f.faultType,
      f.connectorId,
      f.severity,
      f.description
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`folocharge-faults-${Date.now()}.pdf`);
}

export function exportFaultsToCSV(faults: FaultAnalysis[]): void {
  const headers = ['Timestamp', 'Fault Type', 'Connector', 'Severity', 'Description', 'Root Cause', 'Resolution'];
  const rows = faults.map(f => [
    new Date(f.timestamp).toLocaleString(),
    f.faultType,
    f.connectorId,
    f.severity,
    f.description,
    f.rootCause,
    f.resolution
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `folocharge-faults-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface CostAnalysisPDFData {
  totalDowntime: number;
  dailyLoss: number;
  monthlyLoss: number;
  avgSessionValue: number;
  avgSessionsPerDay: number;
  faultTypeCosts: [string, { count: number; totalLoss: number; downtime: number }][];
}

export function exportCostAnalysisToPDF(costData: CostAnalysisPDFData): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('DMS Cost Analysis Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.setFontSize(14);
  doc.text('Revenue Impact Summary', 14, 40);

  doc.setFontSize(10);
  doc.text(`Total Downtime: ${costData.totalDowntime.toFixed(1)} hours`, 14, 48);
  doc.text(`Daily Revenue Loss: ₹${costData.dailyLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 14, 54);
  doc.text(`Monthly Revenue Loss: ₹${costData.monthlyLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 14, 60);
  doc.text(`Avg Session Value: ₹${costData.avgSessionValue}`, 14, 66);
  doc.text(`Avg Sessions/Day: ${costData.avgSessionsPerDay}`, 14, 72);

  doc.setFontSize(14);
  doc.text('Top 5 Costliest Fault Types', 14, 84);

  autoTable(doc, {
    startY: 90,
    head: [['Rank', 'Fault Type', 'Count', 'Downtime (h)', 'Revenue Loss (₹)']],
    body: costData.faultTypeCosts.map(([type, data]: [string, { count: number; totalLoss: number; downtime: number }], index: number) => [
      `#${index + 1}`,
      type,
      data.count.toString(),
      data.downtime.toFixed(1),
      data.totalLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`folocharge-cost-analysis-${Date.now()}.pdf`);
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/** Scenario comparison + projections for the focused scenario in one CSV. */
export function exportScenarioComparisonCSV(comparison: ScenarioComparison): void {
  const lines: string[] = [];

  lines.push('What-If Simulation Report');
  lines.push(
    `Charger,${csvCell(comparison.chargerId)},Horizon (days),${comparison.horizonDays},Revenue (₹/hr),${comparison.economics.revenuePerHour},Maintenance cost/visit (₹),${comparison.economics.maintenanceCostPerVisit}`,
  );
  lines.push('');
  lines.push('Scenario Comparison');
  lines.push(
    [
      'Scenario',
      'Health start',
      'Health end',
      'Projected faults',
      'Downtime loss (₹)',
      'Maintenance visits',
      'Maintenance cost (₹)',
      'Net vs baseline (₹)',
      'Days to critical',
      'Days to failure',
      'p95 loss (₹)',
      'P(critical)',
    ].map(csvCell).join(','),
  );
  for (const row of comparison.rows) {
    lines.push(
      [
        row.scenario.name + (row.isBaseline ? ' (baseline)' : row.isBest ? ' (best)' : ''),
        row.currentHealthScore,
        row.finalHealthScore,
        row.totalProjectedFaults,
        row.totalProjectedLoss,
        row.maintenanceVisits,
        row.maintenanceCost,
        row.netBenefitVsBaseline,
        row.daysUntilCritical ?? '—',
        row.daysUntilFailure ?? '—',
        row.monteCarlo?.p95Loss ?? '—',
        row.monteCarlo ? `${Math.round(row.monteCarlo.criticalProbability * 100)}%` : '—',
      ].map(csvCell).join(','),
    );
  }

  lines.push('');
  lines.push('Daily Projection (focus scenario)');
  lines.push(['Day', 'Date', 'Health', 'Faults', 'Daily loss (₹)', 'Cumulative loss (₹)', 'Risk'].map(csvCell).join(','));
  const focus = comparison.rows.find((r) => r.isBest) ?? comparison.rows[0];
  for (const point of focus.projections) {
    lines.push(
      [
        point.day,
        point.projectedDate.slice(0, 10),
        point.healthScore,
        point.faultCount,
        point.dailyLoss,
        point.cumulativeLoss,
        point.riskLevel,
      ].map(csvCell).join(','),
    );
  }

  downloadCSV(
    lines.join('\n'),
    `folocharge-what-if-${comparison.chargerId}-${Date.now()}.csv`.replace(/\s+/g, '-'),
  );
}

/** Full PDF report: summary, comparison table, sensitivity, recommendation. */
export function exportSimulationPDF(
  comparison: ScenarioComparison,
  focus: ScenarioComparisonRow,
  sensitivity: SensitivityItem[],
): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('What-If Simulation Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(
    `Charger: ${comparison.chargerId}   |   Horizon: ${comparison.horizonDays} days   |   Revenue: ₹${comparison.economics.revenuePerHour}/hr   |   Maintenance: ₹${comparison.economics.maintenanceCostPerVisit}/visit`,
    14,
    34,
  );

  doc.setFontSize(14);
  doc.text('Scenario Comparison', 14, 46);
  autoTable(doc, {
    startY: 52,
    head: [[
      'Scenario',
      'Health end',
      'Faults',
      'Loss (₹)',
      'Maint. (₹)',
      'Net vs baseline (₹)',
      'Days→Critical',
      'p95 loss (₹)',
    ]],
    body: comparison.rows.map((row) => [
      `${row.scenario.name}${row.isBaseline ? ' *' : ''}${row.isBest ? ' †' : ''}`,
      `${row.finalHealthScore}/100`,
      String(row.totalProjectedFaults),
      row.totalProjectedLoss.toLocaleString('en-IN'),
      row.maintenanceCost.toLocaleString('en-IN'),
      row.netBenefitVsBaseline.toLocaleString('en-IN'),
      row.daysUntilCritical ? String(row.daysUntilCritical) : '—',
      row.monteCarlo ? row.monteCarlo.p95Loss.toLocaleString('en-IN') : '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  let y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 52) + 12;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.text(`Parameter Sensitivity — ${focus.scenario.name}`, 14, y);
  autoTable(doc, {
    startY: y + 6,
    head: [['Lever', 'Low ₹', 'High ₹', 'Swing ₹', 'Impact', 'How to act']],
    body: sensitivity.map((item) => [
      item.label,
      item.lowLoss.toLocaleString('en-IN'),
      item.highLoss.toLocaleString('en-IN'),
      item.swing.toLocaleString('en-IN'),
      `${Math.round(item.swingPct * 100)}%`,
      item.hint,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 12;
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.text('Recommendation', 14, y);
  doc.setFontSize(10);
  const wrapped = doc.splitTextToSize(comparison.recommendation, 180) as string[];
  doc.text(wrapped, 14, y + 8);

  const mc = focus.monteCarlo;
  if (mc) {
    const mcY = y + 10 + wrapped.length * 5;
    doc.setFontSize(10);
    doc.text(
      `Monte Carlo (${mc.runs} runs): expected loss ₹${mc.expectedLoss.toLocaleString('en-IN')}, p95 ₹${mc.p95Loss.toLocaleString('en-IN')}, P(critical) ${Math.round(mc.criticalProbability * 100)}%, P(failure) ${Math.round(mc.failureProbability * 100)}%.`,
      14,
      Math.min(mcY, 285),
    );
  }

  doc.save(`folocharge-what-if-${Date.now()}.pdf`);
}
