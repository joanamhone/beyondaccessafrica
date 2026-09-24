import { useEffect, useState, useCallback } from 'react';
import {
  Lock, Plus, Pencil, Trash2, X, Save, Eye, EyeOff,
  ArrowLeft, Search, RefreshCw, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { LoadingSpinner, ErrorState, Card, Badge, Button } from '@/components/ui';
import type { Guide, GuideCategory } from '@/lib/supabase';

const ADMIN_PASSWORD_KEY = 'baa_admin_token';
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-guides`;
const API_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

type EditState = {
  mode: 'create' | 'edit';
  guide: Partial<Guide>;
};

const emptyGuide = (): Partial<Guide> => ({
  slug: '',
  title: '',
  pillar: 'safety',
  category_slug: null,
  tags: [],
  difficulty: 'Beginner',
  read_time_minutes: 5,
  type: 'Article',
  language: 'en',
  summary: '',
  real_world_example: null,
  steps: [],
  mini_quiz: [],
  sources_note: null,
  featured: false,
  featured_order: 0,
  published: true,
  cover_emoji: undefined,
});

export function AdminPage() {
  const { t } = useTranslation();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_PASSWORD_KEY) !== null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const token = sessionStorage.getItem(ADMIN_PASSWORD_KEY);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const [guidesRes, catRes] = await Promise.all([
        fetch(API_URL, { headers: API_HEADERS(token) }),
        fetch(`${API_URL}/categories`, { headers: API_HEADERS(token) }),
      ]);
      if (!guidesRes.ok) throw new Error('Failed to fetch guides');
      const guidesData = await guidesRes.json();
      setGuides(guidesData.guides ?? []);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories ?? []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(false);
    try {
      const res = await fetch(API_URL, { headers: API_HEADERS(password) });
      if (res.status === 401 || res.status === 403) {
        setAuthError(true);
      } else if (res.ok) {
        sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
        setAuthed(true);
        setPassword('');
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
    setGuides([]);
  };

  const handleSave = async () => {
    if (!editState || !token) return;
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        ...editState.guide,
        tags: editState.guide.tags ?? [],
        steps: editState.guide.steps ?? [],
        mini_quiz: editState.guide.mini_quiz ?? [],
        last_updated: new Date().toISOString().slice(0, 10),
      };
      const method = editState.mode === 'create' ? 'POST' : 'PUT';
      const url = editState.mode === 'create' ? API_URL : `${API_URL}/${editState.guide.id}`;
      const res = await fetch(url, {
        method,
        headers: API_HEADERS(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Save failed');
      }
      setEditState(null);
      await fetchData();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: API_HEADERS(token),
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteConfirm(null);
      await fetchData();
    } catch {
      setError(true);
    }
  };

  // Login screen
  if (!authed) {
    return (
      <div className="animate-fade-in flex items-center justify-center px-6 py-16 min-h-[60vh]">
        <Card className="p-8 max-w-sm w-full">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
            Admin Access
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
            Enter the admin password to manage articles.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-teal-500 mb-3"
            style={{
              backgroundColor: 'var(--bg-base)',
              borderColor: authError ? '#ef4444' : 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            autoFocus
          />
          {authError && (
            <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
              <AlertTriangle size={12} /> Incorrect password. Try again.
            </p>
          )}
          <Button onClick={handleLogin} disabled={authLoading || !password} className="w-full">
            {authLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <button
            onClick={() => navigate('#/home')}
            className="mt-4 w-full text-xs text-center transition-colors hover:text-teal-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Back to site
          </button>
        </Card>
      </div>
    );
  }

  // Edit/Create form view
  if (editState) {
    return (
      <div className="animate-fade-in px-6 py-8 max-w-3xl">
        <button
          onClick={() => setEditState(null)}
          className="flex items-center gap-2 text-sm mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back to admin
        </button>

        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {editState.mode === 'create' ? 'New Article' : 'Edit Article'}
        </h1>

        {saveError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={14} /> {saveError}
            </p>
          </div>
        )}

        <Card className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Title
            </label>
            <input
              type="text"
              value={editState.guide.title ?? ''}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, title: e.target.value } })}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Slug (URL identifier)
            </label>
            <input
              type="text"
              value={editState.guide.slug ?? ''}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') } })}
              placeholder="e.g. mobile-money-fraud"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Pillar + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Pillar
              </label>
              <select
                value={editState.guide.pillar ?? 'safety'}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, pillar: e.target.value as 'safety' | 'opportunities' } })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="safety">Safety</option>
                <option value="opportunities">Opportunities</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Difficulty
              </label>
              <select
                value={editState.guide.difficulty ?? 'Beginner'}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, difficulty: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          {/* Category + Read time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select
                value={editState.guide.category_slug ?? ''}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, category_slug: e.target.value || null } })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Read Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={editState.guide.read_time_minutes ?? 5}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, read_time_minutes: parseInt(e.target.value) || 5 } })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Summary
            </label>
            <textarea
              value={editState.guide.summary ?? ''}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, summary: e.target.value } })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 resize-y"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Real world example */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Real World Example (optional)
            </label>
            <textarea
              value={editState.guide.real_world_example ?? ''}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, real_world_example: e.target.value || null } })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 resize-y"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={(editState.guide.tags ?? []).join(', ')}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } })}
              placeholder="e.g. fraud, mobile money, phishing"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Steps */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Steps / Tips
            </label>
            <div className="space-y-2">
              {(editState.guide.steps ?? []).map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const steps = [...(editState.guide.steps ?? [])];
                        steps[i] = { ...steps[i], title: e.target.value };
                        setEditState({ ...editState, guide: { ...editState.guide, steps } });
                      }}
                      placeholder="Step title"
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500"
                      style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <textarea
                      value={step.body}
                      onChange={(e) => {
                        const steps = [...(editState.guide.steps ?? [])];
                        steps[i] = { ...steps[i], body: e.target.value };
                        setEditState({ ...editState, guide: { ...editState.guide, steps } });
                      }}
                      placeholder="Step description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 resize-y"
                      style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const steps = [...(editState.guide.steps ?? [])];
                      steps.splice(i, 1);
                      setEditState({ ...editState, guide: { ...editState.guide, steps } });
                    }}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditState({ ...editState, guide: { ...editState.guide, steps: [...(editState.guide.steps ?? []), { title: '', body: '' }] } })}
                className="text-sm text-teal-500 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add step
              </button>
            </div>
          </div>

          {/* Sources note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Sources Note (optional)
            </label>
            <textarea
              value={editState.guide.sources_note ?? ''}
              onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, sources_note: e.target.value || null } })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 resize-y"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editState.guide.published ?? true}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, published: e.target.checked } })}
                className="h-4 w-4 rounded accent-teal-500"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editState.guide.featured ?? false}
                onChange={(e) => setEditState({ ...editState, guide: { ...editState.guide, featured: e.target.checked } })}
                className="h-4 w-4 rounded accent-teal-500"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Featured</span>
            </label>
          </div>

          {/* Save buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !editState.guide.title || !editState.guide.slug}>
              {saving ? 'Saving...' : <><Save size={14} className="inline mr-1" /> Save</>}
            </Button>
            <Button onClick={() => setEditState(null)} variant="ghost">
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  const filtered = guides.filter((g) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${g.title} ${g.slug} ${g.pillar}`.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in px-6 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-white">
            <Lock size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage articles and content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditState({ mode: 'create', guide: emptyGuide() })} variant="primary">
            <Plus size={14} className="inline mr-1" /> New Article
          </Button>
          <Button onClick={handleLogout} variant="ghost">Logout</Button>
        </div>
      </div>

      {/* Search + refresh */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:border-teal-500"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <Button onClick={fetchData} variant="secondary" className="!px-3">
          <RefreshCw size={16} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Articles</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{guides.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Published</p>
          <p className="text-2xl font-bold text-teal-500">{guides.filter((g) => g.published).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Featured</p>
          <p className="text-2xl font-bold text-amber-500">{guides.filter((g) => g.featured).length}</p>
        </Card>
      </div>

      {/* Article list */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No articles found.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((g) => (
            <Card key={g.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{g.title}</h3>
                  {g.featured && <Badge color="amber">Featured</Badge>}
                  {!g.published && <Badge color="surface">Draft</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className={`font-medium ${g.pillar === 'safety' ? 'text-teal-500' : 'text-amber-500'}`}>
                    {g.pillar}
                  </span>
                  <span>/{g.slug}</span>
                  <span>{g.read_time_minutes} min</span>
                  <span>{new Date(g.last_updated).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => navigate(`#/guide/${g.slug}`)}
                  className="p-2 rounded-lg transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                  style={{ color: 'var(--text-secondary)' }}
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => setEditState({ mode: 'edit', guide: { ...g } })}
                  className="p-2 rounded-lg transition-colors hover:bg-teal-50 dark:hover:bg-teal-900 text-teal-500"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(g.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <Card className="relative p-6 max-w-sm w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
              Delete this article?
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => handleDelete(deleteConfirm)} variant="primary" className="flex-1 !bg-red-500 hover:!bg-red-600">
                Delete
              </Button>
              <Button onClick={() => setDeleteConfirm(null)} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
