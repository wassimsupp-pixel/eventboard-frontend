'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Menu } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface HeaderProps {
  pageTitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ pageTitle = 'Vue d\'ensemble', onMenuClick }: HeaderProps) {
  const [username, setUsername] = useState('admin');

  useEffect(() => {
    getCurrentUser().then((u) => { if (u) setUsername(u.username); });
  }, []);

  return (
    <header className="h-16 bg-bg-sidebar border-b border-border-default flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Left: Menu & Title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="btn-ghost p-2 lg:hidden -ml-2"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{pageTitle}</h1>
          <p className="text-xs text-text-muted hidden sm:block">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell (decorative) */}
        <button className="btn-ghost w-9 h-9 p-0 justify-center relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border-default rounded-lg">
          <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-text-primary">{username || '…'}</span>
        </div>

        {/* Authentification désactivée */}
      </div>
    </header>
  );
}
