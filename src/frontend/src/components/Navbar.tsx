import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    setMobileOpen(false);
    navigate({ to: "/login" });
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/templates", label: "Templates", icon: FileText },
    { href: "/batches", label: "Batches", icon: Package },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Certify<span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Button
                asChild
                disabled={isLoading}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/login">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 rounded-full pr-3 pl-1 py-1 border border-border hover:border-primary/50 transition-colors"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                        {user?.name
                          ? user.name.slice(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:block">
                      {user?.name ?? "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden md:hidden border-t border-border"
            >
              <nav className="py-3 flex flex-col gap-1">
                {isAuthenticated &&
                  navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentPath === link.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
