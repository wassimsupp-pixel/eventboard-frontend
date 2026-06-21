'use client';

import { useState, useEffect } from 'react';
import {
  Lock, Key, Globe, Trash2, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsAPI, dataAPI } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<{ has_api_key: boolean; date_format: string; language: string } | null>(null);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // API key
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);

  // Preferences
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [prefLoading, setPrefLoading] = useState(false);

  useEffect(() => {
    settingsAPI.get().then((res) => {
      setSettings(res.data);
      setDateFormat(res.data.date_format);
    }).catch(() => { });
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (newPw.length < 8) { toast.error('Le mot de passe doit faire au moins 8 caractères'); return; }
    setPwLoading(true);
    try {
      await settingsAPI.changePassword(currentPw, newPw);
      toast.success('Mot de passe mis à jour !');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setPwLoading(false);
    }
  };

  const handleApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.startsWith('sk-ant-')) { toast.error('Clé API invalide'); return; }
    setKeyLoading(true);
    try {
      await settingsAPI.updateApiKey(apiKey);
      toast.success('Clé API sauvegardée !');
      setApiKey('');
      setSettings((s) => s ? { ...s, has_api_key: true } : s);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setKeyLoading(false);
    }
  };

  const handlePreferences = async () => {
    setPrefLoading(true);
    try {
      await settingsAPI.updatePreferences(dateFormat, 'fr');
      toast.success('Préférences mises à jour !');
    } catch {
      toast.error('Erreur');
    } finally {
      setPrefLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('⚠️ Cela supprimera TOUTES vos données (fichiers, événements, analyses). Cette action est irréversible. Continuer ?')) return;
    try {
      await dataAPI.reset();
      toast.success('Toutes les données ont été réinitialisées');
    } catch {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="section-title text-2xl">Paramètres</h2>
        <p className="section-subtitle">Configuration de votre compte EventBoard</p>
      </div>

      {/* Password */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-accent-blue" />
          <h3 className="font-semibold text-text-primary">Changer le mot de passe</h3>
        </div>
        <p className="text-text-secondary text-xs">Le nouveau mot de passe s'applique immédiatement.</p>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="label">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input type={showPw ? 'text' : 'password'} className="input" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" required minLength={8} />
            </div>
            <div>
              <label className="label">Confirmer</label>
              <input type={showPw ? 'text' : 'password'} className={`input ${confirmPw && confirmPw !== newPw ? 'border-status-error' : ''}`} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Mettre à jour
          </button>
        </form>
      </div>

      {/* API Key */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-accent-purple" />
          <h3 className="font-semibold text-text-primary">Clé API Claude (Anthropic)</h3>
          {settings?.has_api_key && (
            <span className="badge-green ml-auto"><CheckCircle2 className="w-3 h-3" />Configurée</span>
          )}
        </div>
        {!settings?.has_api_key && (
          <div className="flex items-center gap-2 bg-status-warning/10 border border-status-warning/30 rounded-lg px-3 py-2 text-status-warning text-xs">
            <AlertTriangle className="w-3 h-3" />
            Aucune clé API configurée — l'analyse IA ne fonctionnera pas.
          </div>
        )}
        <form onSubmit={handleApiKey} className="space-y-3">
          <div>
            <label className="label">Clé API Anthropic</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input pr-10 font-mono text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
              />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={keyLoading || !apiKey} className="btn-purple">
            {keyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            Sauvegarder la clé
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-status-success" />
          <h3 className="font-semibold text-text-primary">Préférences d'affichage</h3>
        </div>
        <div>
          <label className="label">Format de date</label>
          <select className="input w-48" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY (Français)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
          </select>
        </div>
        <button onClick={handlePreferences} disabled={prefLoading} className="btn-secondary">
          {prefLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-status-error/20 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-status-error" />
          <h3 className="font-semibold text-status-error">Zone dangereuse</h3>
        </div>
        <p className="text-text-secondary text-sm">
          Vider le cache supprimera tous les fichiers importés, événements et analyses. Cette action est <strong>irréversible</strong>.
        </p>
        <button
          id="reset-data-btn"
          onClick={handleReset}
          className="btn-danger"
        >
          <Trash2 className="w-4 h-4" />
          Réinitialiser toutes les données
        </button>
      </div>
    </div>
  );
}
