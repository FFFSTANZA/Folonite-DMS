import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Flame,
  IndianRupee,
  Target,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalData } from '@/context/DataContext';
import {
  type AlertChain,
  analyzeAlertChains,
  getAlertSummary,
  type RootCauseNode,
} from '@/utils/alertEngine';

const SEVERITY_STYLES: Record<string, { badge: string; dot: string; border: string }> = {
  Critical: {
    badge: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40',
    dot: 'bg-red-400',
    border: 'border-l-red-400',
  },
  High: {
    badge: 'bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40',
    dot: 'bg-orange-400',
    border: 'border-l-orange-400',
  },
  Medium: {
    badge: 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
    dot: 'bg-amber-400',
    border: 'border-l-amber-400',
  },
  Low: {
    badge: 'bg-green-50 text-green-600 border-green-200/60 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40',
    dot: 'bg-green-400',
    border: 'border-l-green-400',
  },
};

const PRIORITY_STYLES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  immediate: { label: 'Immediate', color: 'text-red-600 dark:text-red-400', icon: <Flame className="h-3 w-3" /> },
  urgent: { label: 'Urgent', color: 'text-orange-600 dark:text-orange-400', icon: <AlertTriangle className="h-3 w-3" /> },
  scheduled: { label: 'Scheduled', color: 'text-amber-600 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
  monitor: { label: 'Monitor', color: 'text-green-600 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function AlertEngine() {
  const { globalParsedLogsData, isProcessed } = useGlobalData();
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const chains = useMemo(() => analyzeAlertChains(globalParsedLogsData), [globalParsedLogsData]);
  const summary = useMemo(() => getAlertSummary(chains), [chains]);

  const toggleChain = (chainId: string) => setExpandedChain(expandedChain === chainId ? null : chainId);
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Smart Alert Engine</h1>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          Root-cause chain analysis with correlated fault patterns and prioritized actions
        </p>
      </div>

      {!isProcessed ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No Data Available</h3>
            <p className="text-[13px] text-muted-foreground text-center">
              Upload charger logs from the Dashboard Home to view alert chains
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard label="Total Chains" value={summary.totalChains} icon={<Target className="h-3.5 w-3.5" />} color="text-foreground" />
            <SummaryCard label="Immediate" value={summary.immediateCount} icon={<Flame className="h-3.5 w-3.5" />} color="text-red-600" highlight={summary.immediateCount > 0} />
            <SummaryCard label="Urgent" value={summary.urgentCount} icon={<AlertTriangle className="h-3.5 w-3.5" />} color="text-orange-600" />
            <SummaryCard label="Scheduled" value={summary.scheduledCount} icon={<Clock className="h-3.5 w-3.5" />} color="text-amber-600" />
            <SummaryCard label="Total Loss" value={`₹${summary.totalEstimatedLoss.toLocaleString()}`} icon={<IndianRupee className="h-3.5 w-3.5" />} color="text-destructive" />
          </div>

          {/* Alert Chains */}
          <div className="space-y-2.5">
            {chains.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-[13px] font-medium">All Clear</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No fault chains detected — all chargers are operating normally
                  </p>
                </CardContent>
              </Card>
            ) : (
              chains.map((chain) => (
                <AlertChainCard
                  key={chain.id} chain={chain} isExpanded={expandedChain === chain.id}
                  expandedNodes={expandedNodes} onToggle={() => toggleChain(chain.id)} onToggleNode={toggleNode}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Alert Chain Card ── */

function AlertChainCard({ chain, isExpanded, expandedNodes, onToggle, onToggleNode }: {
  chain: AlertChain; isExpanded: boolean; expandedNodes: Set<string>;
  onToggle: () => void; onToggleNode: (id: string) => void;
}) {
  const severityStyle = SEVERITY_STYLES[chain.severity] || SEVERITY_STYLES.Medium;
  const priorityInfo = PRIORITY_STYLES[chain.priority];

  const deadlineDate = new Date(chain.actionDeadline);
  const now = new Date();
  const hoursUntilDeadline = Math.max(0, Math.round((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const deadlineText = hoursUntilDeadline < 24 ? `${hoursUntilDeadline}h remaining` : `${Math.ceil(hoursUntilDeadline / 24)}d remaining`;

  return (
    <Card className={`transition-all duration-200 border-l-[3px] ${severityStyle.border} ${isExpanded ? 'shadow-[var(--shadow-md)]' : ''}`}>
      <button onClick={onToggle} className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors rounded-xl">
        {/* Severity Dot */}
        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${severityStyle.dot}`} />

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[13px]">{chain.chargerId}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${severityStyle.badge}`}>{chain.severity}</Badge>
            <span className={`flex items-center gap-1 text-[11px] font-medium ${priorityInfo.color}`}>
              {priorityInfo.icon} {priorityInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
            <span>{chain.totalFaults} faults in {chain.timeSpan}</span>
            <span className="text-border">·</span>
            <span className="text-destructive font-medium">₹{chain.estimatedRevenueLoss.toLocaleString()} loss</span>
            <span className="text-border">·</span>
            <span className={hoursUntilDeadline < 48 ? 'text-destructive font-medium' : ''}>{deadlineText}</span>
          </div>
        </div>

        {/* Chain Depth + Chevron */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-shrink-0">
          <span>{chain.chainDepth}-deep chain</span>
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-border/30 pt-3">
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Root Cause Chain</h4>
            <RootCauseTreeView node={chain.rootCause} depth={0} expandedNodes={expandedNodes} onToggleNode={onToggleNode} />
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Action by: <span className="font-medium text-foreground">{deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
              <span className="text-muted-foreground">Root: <span className="font-medium text-foreground truncate max-w-[180px] inline-block">{chain.rootCause.rootCause}</span></span>
            </div>
            <span className={`font-semibold ${priorityInfo.color}`}>{priorityInfo.label} Priority</span>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── Root Cause Tree View ── */

function RootCauseTreeView({ node, depth, expandedNodes, onToggleNode }: {
  node: RootCauseNode; depth: number; expandedNodes: Set<string>; onToggleNode: (id: string) => void;
}) {
  const isExpanded = expandedNodes.has(node.id) || depth < 1;
  const hasChildren = node.children.length > 0;
  const severityStyle = SEVERITY_STYLES[node.severity] || SEVERITY_STYLES.Medium;

  return (
    <div className={`${depth > 0 ? 'ml-4 pl-3 border-l-2 border-border/30' : ''}`}>
      <div className={`relative flex items-start gap-2.5 p-3 rounded-xl transition-colors ${
        depth === 0 ? 'bg-card border border-border/40 shadow-[var(--shadow-xs)]' : 'bg-muted/30'
      }`}>
        {depth > 0 && <div className="absolute -left-[13px] top-4 w-2.5 h-[1.5px] bg-border/40" />}

        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
          {hasChildren ? (
            <button onClick={() => onToggleNode(node.id)} className="text-muted-foreground hover:text-foreground transition-colors">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <CircleDot className="h-3 w-3 text-muted-foreground/30" />
          )}
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${severityStyle.badge}`}>{node.severity}</Badge>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px]">{node.faultType}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">×{node.count}</span>
            <span className="text-[10px] text-muted-foreground/60 ml-auto">{node.confidence}% confidence</span>
          </div>

          <div className="mt-1.5 flex items-start gap-1.5">
            <ArrowRight className="h-3 w-3 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-foreground">{node.rootCause}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{node.description}</p>
            </div>
          </div>

          <div className="mt-2 p-2 rounded-lg bg-green-50/80 dark:bg-green-950/20 border border-green-200/40 dark:border-green-800/20">
            <p className="text-[11px] text-green-700 dark:text-green-400">
              <span className="font-semibold">Fix:</span> {node.resolution}
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground/50 mt-1.5 tabular-nums">
            {new Date(node.firstOccurrence).toLocaleDateString('en-IN')} → {new Date(node.lastOccurrence).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-1.5 space-y-1.5">
          {node.children.map((child) => (
            <RootCauseTreeView key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} onToggleNode={onToggleNode} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Summary Card ── */

function SummaryCard({ label, value, icon, color, highlight }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; highlight?: boolean;
}) {
  return (
    <Card className={`py-3 ${highlight ? 'border-red-200/60 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10' : ''}`}>
      <CardContent className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className={color}>{icon}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        </div>
        <p className={`text-lg font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
