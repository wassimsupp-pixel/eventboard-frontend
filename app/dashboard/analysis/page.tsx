'use client';

import { useState, useEffect } from 'react';
import {
  Brain, Sparkles, RefreshCw, Clock, ChevronRight,
  TrendingUp, AlertTriangle, Lightbulb, Trophy, FileText, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analysisAPI } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import ProgressBar from '@/components/ui/ProgressBar';

interface AnalysisResult {
  resume_executif: string;
  tendances: string[];
  anomalies: string[];
  recommandations: string[];
  top_evenements: string[];
  conclusion: string;
}

interface AnalysisRecord {
  id: string;
  custom_prompt: string | null;
  total_events: number;
  result: AnalysisResult;
  created_at: string;
}

const SECTION_CONFIG = [
  { key: 'resume_executif', label: 'Résumé exécutif', icon: FileText, color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20', single: true },
  { key: 'tendances', label: 'Tendances détectées', icon: TrendingUp, color: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/20', single: false },
  { key: 'anomalies', label: 'Alertes & Anomalies', icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', single: false },
  { key: 'recommandations', label: 'Recommandations', icon: Lightbulb, color: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'border-accent-purple/20', single: false },
  { key: 'top_evenements', label: 'Top Événements', icon: Trophy, color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', single: false },
  { key: 'conclusion', label: 'Conclusion', icon: Brain, color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20', single: true },
];

function AnalysisSection({ config, result }: { config: typeof SECTION_CONFIG[0]; result: AnalysisResult }) {
  const { key, label, icon: Icon, color, bg, border, single } = config;
  const value = result[key as keyof AnalysisResult];

  return (
    <div className={`rounded-xl border ${border} ${bg} p-5`}>
      <div className={`flex items-center gap-2 mb-3 ${color} font-semibold text-sm`}>
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {single ? (
        <p className="text-text-primary text-sm leading-relaxed">{value as string}</p>
      ) : (
        <ul className="space-y-2">
          {(value as string[]).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
              <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLatest = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        analysisAPI.latest().catch(() => null),
        analysisAPI.history().catch(() => ({ data: [] })),
      ]);
      if (latestRes) setAnalysis(latestRes.data);
      setHistory(historyRes.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadLatest(); }, []);

  const runAnalysis = async () => {
    setRunning(true);
    setProgress(10);
    const toastId = toast.loading('Analyse IA en cours…');

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85));
    }, 1500);

    try {
      const res = await analysisAPI.run(customPrompt || undefined);
      setAnalysis(res.data);
      setHistory((h) => [{ id: res.data.id, total_events: res.data.total_events, created_at: res.data.created_at, custom_prompt: res.data.custom_prompt }, ...h.slice(0, 19)]);
      setProgress(100);
      toast.success('Analyse terminée !', { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur lors de l\'analyse IA', { id: toastId });
    } finally {
      clearInterval(interval);
      setTimeout(() => { setRunning(false); setProgress(0); }, 600);
    }
  };

  const loadHistoryItem = async (id: string) => {
    try {
      const res = await analysisAPI.getById(id);
      setAnalysis(res.data);
    } catch {
      toast.error('Impossible de charger cette analyse');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title text-2xl">Analyses IA</h2>
        <p className="section-subtitle">Analyse intelligente de vos données d'événements via Claude 3.5</p>
      </div>

      {/* Launch panel */}
      <div className="card p-6 border border-accent-purple/20 bg-gradient-to-br from-accent-purple/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent-purple/15 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-accent-purple" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-text-primary">Lancer une analyse IA</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                L'IA analysera l'ensemble de vos données et générera un rapport complet.
              </p>
            </div>
            <div>
              <label className="label">Instruction personnalisée (optionnel)</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Analyse uniquement les événements de mars, Compare les catégories A et B…"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={running}
              />
            </div>
            {running && (
              <ProgressBar value={progress} label="Analyse en cours…" color="purple" className="animate-fade-in" />
            )}
            <div className="flex gap-3">
              <button
                id="run-analysis-btn"
                onClick={runAnalysis}
                disabled={running}
                className="btn-purple"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Analyse en cours…</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Lancer l'analyse</>
                )}
              </button>
              {analysis && (
                <button onClick={loadLatest} className="btn-secondary gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recharger
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main analysis result */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          {loading && (
            <div className="card p-8 text-center text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent-purple" />
              Chargement de l'analyse…
            </div>
          )}

          {!loading && !analysis && (
            <div className="card p-12 text-center border-dashed">
              <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Aucune analyse disponible</h3>
              <p className="text-text-secondary text-sm">
                Cliquez sur "Lancer l'analyse" pour générer votre premier rapport IA.
              </p>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-4 animate-fade-in">
              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Clock className="w-4 h-4" />
                  Analysé le {formatDateTime(analysis.created_at)} · {analysis.total_events} événements
                </div>
                {analysis.custom_prompt && (
                  <span className="badge-purple">"{analysis.custom_prompt}"</span>
                )}
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_CONFIG.slice(0, 1).map((cfg) => (
                  <div key={cfg.key} className="col-span-1 md:col-span-2">
                    <AnalysisSection config={cfg} result={analysis.result} />
                  </div>
                ))}
                {SECTION_CONFIG.slice(1, 5).map((cfg) => (
                  <AnalysisSection key={cfg.key} config={cfg} result={analysis.result} />
                ))}
                {SECTION_CONFIG.slice(5).map((cfg) => (
                  <div key={cfg.key} className="col-span-1 md:col-span-2">
                    <AnalysisSection config={cfg} result={analysis.result} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary text-sm">Historique</h3>
          {history.length === 0 ? (
            <p className="text-text-muted text-xs">Aucun historique</p>
          ) : (
            history.map((h) => (
              <button
                key={h.id}
                onClick={() => loadHistoryItem(h.id)}
                className={`w-full text-left card p-3 hover:border-accent-purple/30 transition-all duration-200 ${analysis?.id === h.id ? 'border-accent-purple/40 bg-accent-purple/5' : ''}`}
              >
                <p className="text-xs text-text-secondary">{formatDateTime(h.created_at)}</p>
                <p className="text-sm text-text-primary font-medium mt-0.5">{h.total_events} événements</p>
                {h.custom_prompt && (
                  <p className="text-xs text-accent-purple mt-1 truncate">"{h.custom_prompt}"</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
