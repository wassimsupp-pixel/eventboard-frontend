'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Brain, BarChart3, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportAPI } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';

interface ExportOption {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  sheets: string[];
  options: { include_ai_analysis: boolean; include_stats: boolean; include_logs: boolean };
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    key: 'raw',
    label: 'Données brutes',
    description: 'Export simple des données consolidées uniquement',
    icon: FileSpreadsheet,
    color: 'text-accent-blue',
    sheets: ['Données consolidées'],
    options: { include_ai_analysis: false, include_stats: false, include_logs: false },
  },
  {
    key: 'with-ai',
    label: 'Données + Analyse IA',
    description: 'Données consolidées avec la dernière analyse IA',
    icon: Brain,
    color: 'text-accent-purple',
    sheets: ['Données consolidées', 'Analyse IA'],
    options: { include_ai_analysis: true, include_stats: false, include_logs: false },
  },
  {
    key: 'full',
    label: 'Rapport complet',
    description: 'Rapport multi-feuilles avec données, statistiques, IA et logs',
    icon: ClipboardList,
    color: 'text-status-success',
    sheets: ['Données consolidées', 'Statistiques', 'Analyse IA', 'Logs d\'import'],
    options: { include_ai_analysis: true, include_stats: true, include_logs: true },
  },
];

export default function ExportPage() {
  const [selected, setSelected] = useState('full');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const option = EXPORT_OPTIONS.find((o) => o.key === selected);
    if (!option) return;

    setExporting(true);
    const toastId = toast.loading('Génération du fichier Excel…');

    try {
      const res = await exportAPI.excel(option.options);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const filename = `EventBoard_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(blob, filename);
      toast.success(`${filename} téléchargé !`, { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur lors de la génération', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const selectedOption = EXPORT_OPTIONS.find((o) => o.key === selected)!;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="section-title text-2xl">Export Excel</h2>
        <p className="section-subtitle">Exportez vos données dans un fichier Excel professionnel et structuré</p>
      </div>

      {/* Format selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary text-sm">Choisissez le format d'export</h3>
        {EXPORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => setSelected(option.key)}
            className={`w-full text-left card p-5 transition-all duration-200 ${
              selected === option.key
                ? 'border-accent-blue/50 bg-accent-blue/5 shadow-glow'
                : 'hover:border-border-default/80 hover:bg-bg-hover/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Radio */}
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selected === option.key ? 'border-accent-blue' : 'border-border-default'
              }`}>
                {selected === option.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <option.icon className={`w-4 h-4 ${option.color}`} />
                  <span className="font-semibold text-text-primary">{option.label}</span>
                  {option.key === 'full' && (
                    <span className="badge-blue text-xs">Recommandé</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-3">{option.description}</p>
                {/* Sheets preview */}
                <div className="flex flex-wrap gap-2">
                  {option.sheets.map((sheet, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-bg-hover px-2.5 py-1 rounded-lg border border-border-subtle">
                      <FileSpreadsheet className="w-3 h-3 text-status-success" />
                      <span className="text-xs text-text-secondary">{sheet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Export summary */}
      <div className="card p-5 bg-bg-sidebar space-y-3">
        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-blue" />
          Résumé de l'export
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Format</span>
            <span className="text-text-primary font-medium">{selectedOption.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Feuilles incluses</span>
            <span className="text-text-primary font-medium">{selectedOption.sheets.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Nom du fichier</span>
            <span className="text-text-primary font-mono text-xs">
              EventBoard_Export_{new Date().toISOString().split('T')[0]}.xlsx
            </span>
          </div>
        </div>
      </div>

      {/* Export button */}
      <button
        id="export-excel-btn"
        onClick={handleExport}
        disabled={exporting}
        className="btn-primary py-3 px-8 text-base"
      >
        {exporting ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Génération en cours…</>
        ) : (
          <><Download className="w-5 h-5" />Télécharger le fichier Excel</>
        )}
      </button>

      {/* Format info */}
      <div className="flex items-start gap-2 text-xs text-text-muted">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-status-success" />
        <span>
          Le fichier Excel généré contient des en-têtes stylisés, des filtres automatiques,
          des largeurs de colonnes optimisées et une mise en forme professionnelle.
        </span>
      </div>
    </div>
  );
}
