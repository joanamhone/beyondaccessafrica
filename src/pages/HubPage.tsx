import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, X, ShieldCheck, Rocket } from 'lucide-react';
import { fetchGuides } from '@/lib/api';
import type { Guide, GuideCategory } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { fallbackCategories, fallbackGuides } from '@/lib/fallback-data';
import { useTranslation } from '@/lib/i18n';
import { useApp } from '@/lib/app-context';
import { LoadingSpinner, ErrorState, Card, Badge } from '@/components/ui';
import { GuideCard } from '@/components/GuideCard';

const TIMEOUT_MS = 3000;
function withTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
  ]);
}

export function HubPage({ pillar }: { pillar: 'safety' | 'opportunities' }) {
  const { t } = useTranslation();
  const { setPageLoading } = useApp();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPageLoading(true);
      setError(false);
      try {
        const [guideData, catData] = await Promise.all([
          fetchGuides(pillar),
          withTimeout(supabase.from('guide_categories').select('*').eq('pillar', pillar).order('name')),
        ]);
        if (cancelled) return;
        setGuides(guideData);
        if (catData.error) throw catData.error;
        setCategories((catData.data as GuideCategory[]) ?? []);
      } catch {
        if (!cancelled) {
          setGuides(fallbackGuides.filter((g) => g.pillar === pillar));
          setCategories(fallbackCategories.filter((c) => c.pillar === pillar));
        }
      } finally {
        if (!cancelled) { setLoading(false); setPageLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [pillar]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    guides.forEach((g) => g.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [guides]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return guides.filter((g) => {
      if (selectedCategory && g.category_slug !== selectedCategory) return false;
      if (selectedDifficulty && g.difficulty !== selectedDifficulty) return false;
      if (q) {
        const haystack = `${g.title} ${g.summary} ${g.tags.join(' ')} ${g.category_slug ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [guides, search, selectedCategory, selectedDifficulty]);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const isSafety = pillar === 'safety';
  const title = isSafety ? t('safety.title') : t('opportunities.title');
  const subtitle = isSafety ? t('safety.subtitle') : t('opportunities.subtitle');

  if (loading) return <LoadingSpinner />;
  if (error && guides.length === 0) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-fade-in px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${isSafety ? 'bg-teal-500' : 'bg-amber-400 text-navy-800 shadow-md shadow-amber-400/30'}`}>
            {isSafety ? <ShieldCheck size={22} /> : <Rocket size={22} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-teal-500"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter toggle (mobile) */}
      <button
        onClick={() => setShowFilters((v) => !v)}
        className="md:hidden flex items-center gap-2 text-sm font-medium mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        <Filter size={16} /> Filters
      </button>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6 space-y-4`}>
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {t('common.allCategories')}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === null ? '#00B8B0' : 'var(--bg-card)',
                  color: selectedCategory === null ? '#0B1F3B' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {t('common.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: selectedCategory === cat.slug ? '#00B8B0' : 'var(--bg-card)',
                    color: selectedCategory === cat.slug ? '#0B1F3B' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div>
          <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {t('common.allDifficulties')}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: selectedDifficulty === null ? '#00B8B0' : 'var(--bg-card)',
                color: selectedDifficulty === null ? '#0B1F3B' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {t('common.allDifficulties')}
            </button>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selectedDifficulty === d ? '#00B8B0' : 'var(--bg-card)',
                  color: selectedDifficulty === d ? '#0B1F3B' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="px-2.5 py-1 rounded-full text-xs transition-colors hover:bg-teal-50 dark:hover:bg-teal-900"
                  style={{
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {filtered.length} {filtered.length === 1 ? 'guide' : 'guides'}
      </div>

      {/* Guide grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.noResults')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
      )}
    </div>
  );
}
