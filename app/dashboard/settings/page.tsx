'use client';

import { useState, useEffect } from 'react';
import {
  Lock, Key, Globe, Trash2, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, ShieldCheck,
  Sparkles, Bot, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsAPI, dataAPI } from '@/lib/api';

type Settings = {
  has_api_key: boolean;
  date_format: string;
  language: string;
  ai_provider: string;
  has_gemini_key: boolean;
  has_claude_key: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // AI Provider
  const [selectedProvider, setSelectedProvider] = useState<'claude' | 'gemini'>('claude');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  // Preferences
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [prefLoading, setPrefLoading] = useState(false);

  useEffect(() => {
    settingsAPI.get().then((res) => {
      const data: Settings = res.data;
      setSettings(data);
      setDateFormat(data.date_format);
      setSelectedProvider((data.ai_provider as 'claude' | 'gemini') || 'claude');
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
    const isGemini = selectedProvider === 'gemini';
    if (isGemini && !apiKey.startsWith('AIza')) {
      toast.error('Clé API Gemini invalide (doit commencer par AIza)');
      return;
    }
    if (!isGemini && !apiKey.startsWith('sk-ant-')) {
      toast.error('Clé API Claude invalide (doit commencer par sk-ant-)');
      return;
    }
    setKeyLoading(true);
    try {
      await settingsAPI.updateApiKey(apiKey, selectedProvider);
      toast.success(`Clé API ${isGemini ? 'Gemini' : 'Claude'} sauvegardée et activée !`);
      setApiKey('');
      setSettings((s) => s ? {
        ...s,
        has_api_key: true,
        ai_provider: selectedProvider,
        has_gemini_key: isGemini ? true : s.has_gemini_key,
        has_claude_key: !isGemini ? true : s.has_claude_key,
      } : s);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSwitchProvider = async (provider: 'claude' | 'gemini') => {
    if (provider === settings?.ai_provider) return;
    setProviderLoading(true);
    try {
      await settingsAPI.setAiProvider(provider);
      setSettings((s) => s ? { ...s, ai_provider: provider } : s);
      toast.success(`Provider IA changé vers ${provider === 'gemini' ? 'Gemini' : 'Claude'} !`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setProviderLoading(false);
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

  const isGeminiSelected = selectedProvider === 'gemini';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="section-title text-2xl">Paramètres</h2>
        <p className="section-subtitle">Configuration de votre compte EventBoard</p>
      </div>

      {/* ─── AI Provider Selector ─────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4 text-accent-purple" />
          <h3 className="font-semibold text-text-primary">Moteur d&apos;IA</h3>
          {settings && (
            <span className="ml-auto text-xs text-text-muted">
              Actif : <span className="text-accent-purple font-medium">
                {settings.ai_provider === 'gemini' ? '✦ Gemini' : '◆ Claude'}
              </span>
            </span>
          )}
        </div>
        <p className="text-text-secondary text-xs">
          Choisissez le moteur IA qui sera utilisé pour analyser vos données événementielles.
        </p>

        {/* Provider cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Claude card */}
          <button
            type="button"
            onClick={() => setSelectedProvider('claude')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedProvider === 'claude'
                ? 'border-accent-purple bg-accent-purple/10'
                : 'border-border-default hover:border-border-hover bg-bg-secondary'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold">◆</div>
              <span className="font-semibold text-text-primary text-sm">Claude</span>
              {settings?.has_claude_key && (
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success ml-auto" />
              )}
            </div>
            <p className="text-text-muted text-xs">Anthropic · claude-3.5-sonnet</p>
            {settings?.ai_provider === 'claude' && (
              <span className="absolute top-2 right-2 text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded-full">ACTIF</span>
            )}
          </button>

          {/* Gemini card */}
          <button
            type="button"
            onClick={() => setSelectedProvider('gemini')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedProvider === 'gemini'
                ? 'border-accent-blue bg-accent-blue/10'
                : 'border-border-default hover:border-border-hover bg-bg-secondary'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">✦</div>
              <span className="font-semibold text-text-primary text-sm">Gemini</span>
              {settings?.has_gemini_key && (
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success ml-auto" />
              )}
            </div>
            <p className="text-text-muted text-xs">Google · gemini-1.5-flash</p>
            {settings?.ai_provider === 'gemini' && (
              <span className="absolute top-2 right-2 text-[10px] bg-accent-blue/20 text-accent-blue px-1.5 py-0.5 rounded-full">ACTIF</span>
            )}
          </button>
        </div>

        {/* Switch provider button (only if key already saved) */}
        {settings && selectedProvider !== settings.ai_provider && (
          ((selectedProvider === 'claude' && settings.has_claude_key) ||
           (selectedProvider === 'gemini' && settings.has_gemini_key)) && (
            <button
              onClick={() => handleSwitchProvider(selectedProvider)}
              disabled={providerLoading}
              className="btn-secondary w-full"
            >
              {providerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Activer {selectedProvider === 'gemini' ? 'Gemini' : 'Claude'}
            </button>
          )
        )}

        {/* API key form */}
        <div className="border-t border-border-default pt-4 space-y-3">
          <label className="label">
            {isGeminiSelected
              ? 'Clé API Google Gemini'
              : 'Clé API Anthropic Claude'}
          </label>

          {/* Status badge */}
          {settings && (
            isGeminiSelected
              ? (settings.has_gemini_key
                ? <div className="flex items-center gap-1.5 text-status-success text-xs"><CheckCircle2 className="w-3.5 h-3.5" />Clé Gemini configurée</div>
                : <div className="flex items-center gap-2 bg-status-warning/10 border border-status-warning/30 rounded-lg px-3 py-2 text-status-warning text-xs"><AlertTriangle className="w-3 h-3" />Aucune clé Gemini — ajoutez-en une ci-dessous</div>)
              : (settings.has_claude_key
                ? <div className="flex items-center gap-1.5 text-status-success text-xs"><CheckCircle2 className="w-3.5 h-3.5" />Clé Claude configurée</div>
                : <div className="flex items-center gap-2 bg-status-warning/10 border border-status-warning/30 rounded-lg px-3 py-2 text-status-warning text-xs"><AlertTriangle className="w-3 h-3" />Aucune clé Claude — ajoutez-en une ci-dessous</div>)
          )}

          <form onSubmit={handleApiKey} className="space-y-3">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input pr-10 font-mono text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isGeminiSelected ? 'AIzaSy...' : 'sk-ant-api03-...'}
              />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={keyLoading || !apiKey} className={isGeminiSelected ? 'btn-primary' : 'btn-purple'}>
              {keyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Sauvegarder &amp; activer {isGeminiSelected ? 'Gemini' : 'Claude'}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Password ───────────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-accent-blue" />
          <h3 className="font-semibold text-text-primary">Changer le mot de passe</h3>
        </div>
        <p className="text-text-secondary text-xs">Le nouveau mot de passe s&apos;applique immédiatement.</p>
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

      {/* ─── Preferences ───────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-status-success" />
          <h3 className="font-semibold text-text-primary">Préférences d&apos;affichage</h3>
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

      {/* ─── Danger zone ────────────────────────────────────────────────────── */}
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
