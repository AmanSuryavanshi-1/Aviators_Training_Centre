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
  ArrowRight
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

export function AdminSidebar({ className }: AdminSidebarProps) {
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
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            level > 0 && 'ml-4 border-l border-slate-200 dark:border-slate-700 pl-4',
            active
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          )}
        >
          <Link
            href={item.href}
            className="flex items-center gap-3 flex-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpanded(item.href)}
            >
              <Menu className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
            </Button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
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
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Admin Panel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Blog Management
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="space-y-2">
              <Link href="/admin/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  View Website
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navigationItems.map(item => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p>Aviators Training Centre</p>
              <p>Admin Dashboard v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
