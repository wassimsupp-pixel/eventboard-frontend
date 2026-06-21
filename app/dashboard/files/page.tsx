'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Trash2, Clock, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { filesAPI, dataAPI } from '@/lib/api';
import { formatFileSize, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import ProgressBar from '@/components/ui/ProgressBar';
import { SkeletonTable } from '@/components/ui/SkeletonLoader';

interface FileRecord {
  id: string;
  original_name: string;
  size_bytes: number;
  row_count: number;
  status: string;
  uploaded_at: string;
  error_msg: string | null;
}

interface DetectionResult {
  file_id: string;
  detected_columns: string[];
  suggested_mapping: Record<string, string | null>;
  preview_rows: Record<string, string>[];
  validation_errors: string[];
  duplicate_count: number;
}

interface MappingState {
  date_col: string | null;
  title_col: string | null;
  category_col: string | null;
  participants_col: string | null;
  [key: string]: string | null;
}

const FIELD_LABELS: Record<string, string> = {
  date_col: 'Colonne Date',
  title_col: 'Colonne Titre / Nom',
  category_col: 'Colonne Catégorie',
  participants_col: 'Colonne Participants',
};

function MappingModal({
  result,
  onApply,
  onSkip,
}: {
  result: DetectionResult;
  onApply: (fileId: string, mapping: MappingState) => void;
  onSkip: () => void;
}) {
  const [mapping, setMapping] = useState<MappingState>({
    date_col: result.suggested_mapping.date_col || null,
    title_col: result.suggested_mapping.title_col || null,
    category_col: result.suggested_mapping.category_col || null,
    participants_col: result.suggested_mapping.participants_col || null,
  });
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Configuration des colonnes</h3>
            <p className="text-sm text-text-secondary mt-0.5">
              {result.detected_columns.length} colonnes détectées — ajustez le mapping si nécessaire
            </p>
          </div>
          <button onClick={onSkip} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Validation warnings */}
          {result.validation_errors.length > 0 && (
            <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-status-warning font-medium text-sm">
                <AlertTriangle className="w-4 h-4" />
                Avertissements
              </div>
              {result.validation_errors.map((e, i) => (
                <p key={i} className="text-status-warning/80 text-xs pl-6">{e}</p>
              ))}
            </div>
          )}

          {/* Mapping fields */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(FIELD_LABELS).map(([field, label]) => (
              <div key={field}>
                <label className="label">{label}</label>
                <select
                  className="input"
                  value={mapping[field as keyof MappingState] || ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value || null }))}
                >
                  <option value="">— Ignorer cette colonne —</option>
                  {result.detected_columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview toggle */}
          <button
            className="btn-ghost text-xs gap-1"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showPreview ? 'Masquer' : 'Voir'} l'aperçu des données ({result.preview_rows.length} lignes)
          </button>

          {showPreview && result.preview_rows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border-default">
              <table className="data-table w-full text-xs">
                <thead>
                  <tr>
                    {result.detected_columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.preview_rows.map((row, i) => (
                    <tr key={i}>
                      {result.detected_columns.map((col) => (
                        <td key={col}>{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border-default">
          <button className="btn-secondary" onClick={onSkip}>Ignorer ce fichier</button>
          <button
            id="apply-mapping-btn"
            className="btn-primary"
            onClick={() => onApply(result.file_id, mapping)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Importer {result.suggested_mapping ? 'avec ce mapping' : 'les données'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingMappings, setPendingMappings] = useState<DetectionResult[]>([]);
  const [currentMapping, setCurrentMapping] = useState<DetectionResult | null>(null);

  const loadFiles = async () => {
    try {
      const res = await filesAPI.list();
      setFiles(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadFiles(); }, []);

  // Show next pending mapping modal
  useEffect(() => {
    if (!currentMapping && pendingMappings.length > 0) {
      setCurrentMapping(pendingMappings[0]);
    }
  }, [pendingMappings, currentMapping]);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    accepted.forEach((f) => formData.append('files', f));

    try {
      setUploadProgress(40);
      const res = await filesAPI.upload(formData);
      setUploadProgress(80);
      const results: DetectionResult[] = res.data;
      toast.success(`${accepted.length} fichier(s) uploadé(s) avec succès`);
      setPendingMappings((prev) => [...prev, ...results]);
      loadFiles();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur lors de l\'upload');
    } finally {
      setUploadProgress(100);
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 10,
    disabled: uploading,
  });

  const handleApplyMapping = async (fileId: string, mapping: MappingState) => {
    try {
      const res = await filesAPI.applyMapping({ file_id: fileId, mapping });
      toast.success(res.data.message);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur lors de l\'import');
    }
    setPendingMappings((prev) => prev.filter((p) => p.file_id !== fileId));
    setCurrentMapping(null);
    loadFiles();
  };

  const handleSkipMapping = () => {
    if (!currentMapping) return;
    setPendingMappings((prev) => prev.filter((p) => p.file_id !== currentMapping.file_id));
    setCurrentMapping(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" et toutes ses données ?`)) return;
    try {
      await filesAPI.delete(id);
      toast.success('Fichier supprimé');
      loadFiles();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mapping modal */}
      {currentMapping && (
        <MappingModal
          result={currentMapping}
          onApply={handleApplyMapping}
          onSkip={handleSkipMapping}
        />
      )}

      <div>
        <h2 className="section-title text-2xl">Mes fichiers</h2>
        <p className="section-subtitle">Importez et gérez vos fichiers Excel et CSV</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        id="dropzone"
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-accent-blue bg-accent-blue/10 shadow-glow'
            : 'border-border-default hover:border-accent-blue/50 hover:bg-bg-hover/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isDragActive ? 'bg-accent-blue/20 scale-110' : 'bg-bg-card'
          }`}>
            <Upload className={`w-7 h-7 ${isDragActive ? 'text-accent-blue' : 'text-text-muted'}`} />
          </div>
          <div>
            <p className="text-text-primary font-medium">
              {isDragActive ? 'Déposez vos fichiers ici !' : 'Glissez-déposez vos fichiers'}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              ou <span className="text-accent-blue font-medium">cliquez pour parcourir</span>
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            {['.xlsx', '.xls', '.csv'].map((ext) => (
              <span key={ext} className="badge-gray">{ext}</span>
            ))}
            <span className="badge-gray">max. 10 fichiers</span>
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <ProgressBar
          value={uploadProgress}
          label="Upload en cours…"
          color="blue"
          className="animate-fade-in"
        />
      )}

      {/* File history */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <h3 className="font-semibold text-text-primary">Historique des imports</h3>
          <span className="badge-blue">{files.length} fichier(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Fichier</th>
                <th>Date d'import</th>
                <th>Lignes</th>
                <th>Taille</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            {loading ? (
              <SkeletonTable rows={4} />
            ) : (
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-text-muted">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Aucun fichier importé — glissez un fichier ci-dessus
                    </td>
                  </tr>
                ) : (
                  files.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-accent-green flex-shrink-0 text-status-success" />
                          <span className="font-medium text-text-primary truncate max-w-[200px]" title={f.original_name}>
                            {f.original_name}
                          </span>
                        </div>
                      </td>
                      <td className="text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(f.uploaded_at)}
                        </div>
                      </td>
                      <td className="text-text-primary font-mono text-sm">{f.row_count}</td>
                      <td className="text-text-secondary text-sm">{formatFileSize(f.size_bytes)}</td>
                      <td>
                        <span className={`badge ${
                          f.status === 'imported' ? 'badge-green' :
                          f.status === 'pending_mapping' ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {getStatusLabel(f.status)}
                        </span>
                        {f.error_msg && (
                          <span title={f.error_msg} className="ml-1.5 text-status-error cursor-help">
                            <Info className="w-3 h-3 inline" />
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(f.id, f.original_name)}
                          className="btn-ghost text-status-error hover:text-white hover:bg-status-error p-1.5 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
