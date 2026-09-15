import { ChevronRight, Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import routes from "../../routes";

const Header = () => {
  const location = useLocation();
  const navigation = routes.filter((route) => route.visible !== false);

  const isActive = (path: string) => location.pathname === path;
  const currentPage = routes.find(r => r.path === location.pathname);

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dms-theme') === 'dark' ||
        (!localStorage.getItem('dms-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dms-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="h-12 flex items-center px-6">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-primary" fill="currentColor" />
            <span className="font-medium">DMS</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            {currentPage?.name || 'Dashboard'}
          </span>
        </div>

        {/* Desktop Nav — Pill-style tabs like Airtable */}
        <div className="hidden md:flex items-center gap-1 ml-8">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors
                ${isActive(item.path)
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Dark mode toggle */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setDark(!dark)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
