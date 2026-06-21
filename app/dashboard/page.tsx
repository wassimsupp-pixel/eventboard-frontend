'use client';

import { useEffect, useState } from 'react';
import {
  Calendar, FileSpreadsheet, Brain, TrendingUp,
  RefreshCw, ChevronRight, Sparkles, Database,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { dataAPI } from '@/lib/api';
import { formatNumber, formatDateTime } from '@/lib/utils';
import { MonthlyHistogram, CategoryPie, TimelineLine } from '@/components/charts/Charts';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

interface Stats {
  total_events: number;
  file_count: number;
  by_category: { category: string; count: number }[];
  by_month: { month: string; count: number }[];
  last_analysis_at: string | null;
  ai_status: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="card p-5 group hover:border-accent-blue/30 transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color} tracking-tight`}>{value}</p>
          {sub && <p className="text-text-muted text-xs mt-1.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current/10`} style={{ background: 'rgba(59,130,246,0.12)' }}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dataAPI.stats();
      setStats(res.data);
      setError('');
    } catch (e: any) {
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const aiStatus = stats?.ai_status || 'ready';
  const aiStatusLabel = aiStatus === 'ready' ? 'Prêt' : aiStatus === 'running' ? 'En cours…' : 'Erreur';
  const aiStatusColor = aiStatus === 'ready' ? 'text-status-success' : aiStatus === 'running' ? 'text-status-warning' : 'text-status-error';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-2xl">Vue d'ensemble</h2>
          <p className="section-subtitle">Toutes vos données d'événements en un coup d'œil</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary gap-2" id="refresh-stats-btn">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-status-error/10 border border-status-error/30 text-status-error rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={Database}
              label="Total événements"
              value={formatNumber(stats?.total_events ?? 0)}
              sub={`Depuis ${stats?.file_count ?? 0} fichier(s)`}
              color="text-accent-blue"
              href="/dashboard/files"
            />
            <StatCard
              icon={FileSpreadsheet}
              label="Fichiers importés"
              value={formatNumber(stats?.file_count ?? 0)}
              sub="Excel · CSV"
              color="text-accent-purple"
              href="/dashboard/files"
            />
            <StatCard
              icon={Calendar}
              label="Dernière analyse"
              value={stats?.last_analysis_at ? formatDateTime(stats.last_analysis_at) : '—'}
              sub={stats?.last_analysis_at ? 'Analyse IA' : 'Aucune analyse'}
              color="text-status-success"
              href="/dashboard/analysis"
            />
            <StatCard
              icon={Brain}
              label="Statut IA"
              value={aiStatusLabel}
              sub="Claude 3.5 Sonnet"
              color={aiStatusColor}
              href="/dashboard/analysis"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/dashboard/files', icon: FileSpreadsheet, label: 'Importer des fichiers', color: 'text-accent-blue' },
          { href: '/dashboard/analysis', icon: Sparkles, label: 'Lancer une analyse IA', color: 'text-accent-purple' },
          { href: '/dashboard/export', icon: TrendingUp, label: 'Exporter en Excel', color: 'text-status-success' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex items-center gap-3 hover:border-accent-blue/30 transition-all duration-200 group"
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">{label}</span>
            <ChevronRight className="w-4 h-4 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Charts row */}
      {!loading && stats && (
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly histogram */}
          <div className="card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary text-sm">Événements par mois</h3>
              <span className="badge-blue">{stats.by_month.length} mois</span>
            </div>
            {stats.by_month.length > 0 ? (
              <MonthlyHistogram data={stats.by_month} />
            ) : (
              <EmptyChart text="Aucune donnée mensuelle" />
            )}
          </div>

          {/* Category pie */}
          <div className="card p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">Par catégorie</h3>
            {stats.by_category.length > 0 ? (
              <CategoryPie
                data={stats.by_category.map(c => ({
                  category: c.category || 'Non renseigné',
                  count: c.count,
                }))}
              />
            ) : (
              <EmptyChart text="Aucune catégorie" />
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {!loading && stats && stats.by_month.length > 1 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary text-sm">Évolution temporelle</h3>
            <span className="text-text-muted text-xs">Courbe d'évolution</span>
          </div>
          <TimelineLine data={stats.by_month} />
        </div>
      )}

      {/* Empty state */}
      {!loading && (stats?.total_events ?? 0) === 0 && (
        <div className="card p-12 text-center border-dashed">
          <FileSpreadsheet className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Aucune donnée</h3>
          <p className="text-text-secondary text-sm mb-6">
            Importez vos premiers fichiers Excel ou CSV pour démarrer l'analyse.
          </p>
          <Link href="/dashboard/files" className="btn-primary">
            <FileSpreadsheet className="w-4 h-4" />
            Importer des fichiers
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
      {text}
    </div>
  );
}
