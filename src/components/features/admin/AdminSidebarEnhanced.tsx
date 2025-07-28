'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  BarChart3,
  Users,
  Tags,
  Search,
  Menu,
  X,
  Home,
  Eye,
  TrendingUp,
  Calendar,
  Filter,
  BookOpen,
  Target,
  Zap,
  Bot,
  AlertTriangle,
  Trash2,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Simplified navigation items - removed complex features
const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Blog Management',
    href: '/admin/blogs',
    icon: FileText,
    children: [
      {
        title: 'All Posts',
        href: '/admin/blogs',
        icon: BookOpen,
      },
      {
        title: 'Create New',
        href: '/admin/new',
        icon: PlusCircle,
      },
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tags,
      },
    ],
  },
  {
    title: 'N8N Automation',
    href: '/admin/n8n-review',
    icon: Bot,
    children: [
      {
        title: 'Review Queue',
        href: '/admin/n8n-review',
        icon: ArrowRight,
      },
      {
        title: 'Error Logs',
        href: '/admin/n8n-errors',
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: 'SEO Tools',
    href: '/admin/seo',
    icon: Search,
    children: [
      {
        title: 'SEO Overview',
        href: '/admin/seo',
        icon: Eye,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebarEnhanced({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const expanded = isExpanded(item.href);

    return (
      <div key={item.href}>
        <div
          className={cn(
            'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            level > 0 && 'ml-6 border-l-2 border-transparent pl-4',
            active
              ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 dark:from-teal-900/30 dark:to-cyan-900/30 dark:text-teal-300 shadow-sm'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
            level === 0 && active && 'border-l-4 border-teal-500 -ml-[2px]'
          )}
        >
          <Link
            href={item.href}
            className="flex items-center gap-3 flex-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <item.icon className={cn(
              "h-4 w-4 transition-colors",
              active ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
            )} />
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-auto",
                  active ? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" : ""
                )}
              >
                {item.badge}
              </Badge>
            )}
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => toggleExpanded(item.href)}
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3 text-slate-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-slate-400" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.children!.map(child => (
              <NavItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden border-teal-200 text-teal-600"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-72 transform bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header with Aviation Theme */}
          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Admin Panel
                </h2>
                <p className="text-sm text-white/80">
                  Aviators Training Centre
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="space-y-2">
              <Link href="/admin/new">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Home className="h-4 w-4 mr-2" />
                  View Website
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {navigationItems.map(item => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">ATC Admin</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Version 1.0</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
