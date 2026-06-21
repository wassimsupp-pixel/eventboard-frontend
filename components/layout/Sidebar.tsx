'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderOpen, BarChart3, Download, Settings,
  ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/files', label: 'Mes fichiers', icon: FolderOpen },
  { href: '/dashboard/analysis', label: 'Analyses IA', icon: BarChart3 },
  { href: '/dashboard/export', label: 'Export', icon: Download },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-bg-sidebar border-r border-border-default flex flex-col h-full relative">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xs">EB</span>
          </div>
          <span className="font-bold text-text-primary text-lg tracking-tight">
            Event<span className="text-accent-blue">Board</span>
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 lg:hidden -mr-1"
            title="Fermer le menu"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110', active ? 'text-accent-blue' : '')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-accent-blue" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-default">
        <div className="text-xs text-text-muted text-center">
          EventBoard v1.0 · Wawa Dev
        </div>
      </div>
    </aside>
  );
}
