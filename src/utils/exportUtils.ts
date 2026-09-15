import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FaultAnalysis, CostAnalysis, CostParameters } from '@/types/fault';
import type { Recommendation } from '@/types/analytics';
import { formatCurrency } from './costCalculator';

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
