import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, DollarSign, Zap, BarChart3, HelpCircle, Info, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard Home',
    href: '/',
    icon: Home,
    description: 'Executive summary and key metrics'
  },
  {
    title: 'Fault Diagnosis',
    href: '/fault-diagnosis',
    icon: Activity,
    description: 'Analyze charger failures and errors'
  },
  {
    title: 'Cost Analysis',
    href: '/cost-analysis',
    icon: DollarSign,
    description: 'Calculate revenue loss from downtime'
  },
  {
    title: 'Predictive Failure',
    href: '/predictive',
    icon: Zap,
    description: 'Identify at-risk chargers before failure'
  },
  {
    title: 'Performance Analytics',
    href: '/performance-analytics',
    icon: BarChart3,
    description: 'Site and charger performance metrics'
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar text-sidebar-foreground transition-transform duration-300",
          "md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Branding */}
          <div className="border-b border-border/40 p-6">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all duration-300" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Zap className="h-6 w-6 text-white" fill="white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Folonite DMS
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wider">
                  DIAGNOSTIC MANAGEMENT SYSTEM
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
            <TooltipProvider>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Tooltip key={item.href} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary to-accent text-white shadow-premium'
                            : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                        )}
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                          isActive ? "scale-110" : "group-hover:scale-110"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>

          {/* Footer Links */}
          <div className="border-t border-border/40 p-4 space-y-1">
            <Link
              to="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-hover transition-smooth group"
            >
              <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Help & Documentation</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-hover transition-smooth group"
            >
              <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>About Folonite DMS</span>
            </Link>
            <div className="mt-4 px-3 pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Built with ⚡ by <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Folonite</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
