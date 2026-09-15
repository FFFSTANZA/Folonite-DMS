import { Activity, BarChart3, Bell, ChevronRight, DollarSign, HelpCircle, Home, Info, Menu, SlidersHorizontal, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and key metrics'
  },
  {
    title: 'Fault Diagnosis',
    href: '/fault-diagnosis',
    icon: Activity,
    description: 'Analyze charger failures'
  },
  {
    title: 'Cost Analysis',
    href: '/cost-analysis',
    icon: DollarSign,
    description: 'Revenue loss from downtime'
  },
  {
    title: 'Predictive Failure',
    href: '/predictive',
    icon: Zap,
    description: 'At-risk chargers'
  },
  {
    title: 'What-If Simulator',
    href: '/what-if',
    icon: SlidersHorizontal,
    description: 'Project failure scenarios'
  },
  {
    title: 'Alert Engine',
    href: '/alerts',
    icon: Bell,
    description: 'Root-cause chains'
  },
  {
    title: 'Performance',
    href: '/performance-analytics',
    icon: BarChart3,
    description: 'Site and charger metrics'
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        size="icon"
        className={cn(
          "fixed top-3 left-3 z-50 md:hidden",
          "h-8 w-8",
          "bg-card border border-border/60 text-foreground",
          "hover:bg-muted/60",
          "shadow-[var(--shadow-sm)] rounded-lg"
        )}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/15 z-40 md:hidden backdrop-blur-[2px]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — Airtable × Apple: warm, clean, airy */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[210px]",
          "bg-card/95 backdrop-blur-md border-r border-border/40",
          "transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          "md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="px-4 pt-5 pb-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-md)] transition-shadow">
                <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-[13px] font-semibold text-foreground leading-tight tracking-tight">
                  FoloCharge
                </h1>
                <p className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">
                  EV Diagnostics
                </p>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border/40" />

          {/* Navigation — Minimal, clean links */}
          <nav className="flex-1 px-2.5 py-2.5 space-y-0.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary/8 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.1)]'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="flex-1">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-primary/40" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer — Clean, minimal */}
          <div className="px-2.5 pb-3 space-y-0.5">
            <div className="mx-1.5 h-px bg-border/40 mb-2" />
            <Link
              to="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-150"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-150"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <div className="mt-3 px-2.5">
              <p className="text-[10px] text-muted-foreground/50 font-medium">
                FoloCharge DMS
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
