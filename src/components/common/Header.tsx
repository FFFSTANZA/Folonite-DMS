import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import routes from "../../routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = routes.filter((route) => route.visible !== false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all duration-300" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Zap className="h-6 w-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Folonite DMS
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
                DIAGNOSTIC MANAGEMENT SYSTEM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Always visible on desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {isActive(item.path) && (
                  <span className="absolute inset-0 bg-primary/10 rounded-lg" />
                )}
                <span className="relative">{item.name}</span>
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - Always visible on desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/help">Help</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
              asChild
            >
              <Link to="/about">About</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={`w-full ${isActive(item.path) ? "text-primary font-medium" : ""}`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link to="/help" className="w-full">
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="w-full">
                    About
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
