import { useEffect, useState } from 'react';
import { ShieldCheck, Rocket, ArrowRight, Users, BookOpen, AlertTriangle, Sparkles } from 'lucide-react';
import { fetchFeaturedGuides, fetchGuideCount } from '@/lib/api';
import type { Guide } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { useApp } from '@/lib/app-context';
import { Card, Badge, Button, LoadingSpinner } from '@/components/ui';
import { GuideCard } from '@/components/GuideCard';
import { ScamAlertTicker } from '@/components/ScamAlertTicker';

const onboardingOptions = [
  { id: 'scams', label: 'Being scammed or tricked out of money', guides: ['mobile-money-fraud', 'phishing-messages', 'fake-job-ads'] },
  { id: 'jobs', label: 'Finding real online work or income', guides: ['remote-work-guide', 'freelancing-guide', 'spotting-legitimate-opportunity'] },
  { id: 'privacy', label: 'Someone stealing my information or identity', guides: ['identity-theft', 'phishing-messages', 'social-media-safety'] },
  { id: 'news', label: 'Believing false news and information', guides: ['misinformation', 'social-media-safety'] },
  { id: 'learn', label: 'Learning new skills online', guides: ['online-learning', 'digital-entrepreneurship', 'freelancing-guide'] },
];

export function HomePage() {
  const { t } = useTranslation();
  const { setPageLoading } = useApp();
  const [featured, setFeatured] = useState<Guide[]>([]);
  const [count, setCount] = useState({ published: 0, total: 20 });
  const [loading, setLoading] = useState(true);
  const [onboardingStarted, setOnboardingStarted] = useState(false);
  const [onboardingAnswer, setOnboardingAnswer] = useState<string | null>(null);
  const [recommendedGuides, setRecommendedGuides] = useState<Guide[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, c] = await Promise.all([fetchFeaturedGuides(), fetchGuideCount()]);
        if (!cancelled) {
          setFeatured(f);
          setCount(c);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) { setLoading(false); setPageLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOnboarding = async (optionId: string) => {
    const option = onboardingOptions.find((o) => o.id === optionId);
    if (!option) return;
    setOnboardingAnswer(optionId);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await Promise.race([
        supabase
          .from('guides')
          .select('*')
          .in('slug', option.guides)
          .eq('published', true),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        ),
      ]);
      setRecommendedGuides((data as Guide[]) ?? []);
    } catch {
      const { fallbackGuides } = await import('@/lib/fallback-data');
      setRecommendedGuides(fallbackGuides.filter((g) => option.guides.includes(g.slug)));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{
          background: 'radial-gradient(circle at 20% 30%, #00B8B0 0%, transparent 50%), radial-gradient(circle at 80% 70%, #F4B400 0%, transparent 50%)'
        }} />
        <div className="relative px-6 py-12 md:py-16 max-w-4xl mx-auto">
          <Badge color="amber">
            <Sparkles size={10} /> {t('home.isocCredit')}
          </Badge>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Beyond Access Africa
          </h1>
          <p className="mt-3 text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('home.tagline')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('#/safety')} variant="primary">
              <ShieldCheck size={16} className="inline mr-2" />
              {t('nav.safety')}
            </Button>
            <Button onClick={() => navigate('#/opportunities')} variant="secondary">
              <Rocket size={16} className="inline mr-2" />
              {t('nav.opportunities')}
            </Button>
          </div>
          <div className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {count.published} {t('common.guideCount')} ({count.published} of {count.total})
          </div>
        </div>
      </section>

      <ScamAlertTicker />

      <div className="px-6 py-8 space-y-10 max-w-5xl mx-auto">
        {/* About */}
        <section>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('home.aboutTitle')}</h2>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>{t('home.aboutP1')}</p>
            <p>{t('home.aboutP2')}</p>
            <p>{t('home.aboutP3')}</p>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users size={16} className="text-teal-500" />
              {t('home.whoFor')}
            </h3>
            <ul className="space-y-2">
              {[t('home.whoFor1'), t('home.whoFor2'), t('home.whoFor3')].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-teal-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Featured guides */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles size={18} className="text-amber-400" />
                {t('home.featuredTitle')}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((g) => (
                <GuideCard key={g.id} guide={g} />
              ))}
            </div>
          </section>
        )}

        {/* Onboarding quiz */}
        <section>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-teal-500" />
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('home.onboardingTitle')}</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('home.onboardingSubtitle')}</p>

            {!onboardingStarted ? (
              <Button onClick={() => setOnboardingStarted(true)} variant="primary">
                {t('home.onboardingStart')} <ArrowRight size={14} className="inline ml-1" />
              </Button>
            ) : onboardingAnswer === null ? (
              <div className="space-y-2">
                {onboardingOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOnboarding(opt.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('home.onboardingResult')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedGuides.map((g) => (
                    <GuideCard key={g.id} guide={g} />
                  ))}
                </div>
                <button
                  onClick={() => { setOnboardingAnswer(null); }}
                  className="text-sm text-teal-500 hover:underline"
                >
                  {t('common.tryAgain')}
                </button>
              </div>
            )}
          </Card>
        </section>

        {/* Pillar cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6" onClick={() => navigate('#/safety')}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('safety.title')}</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('safety.subtitle')}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-500">
              {t('common.readMore')} <ArrowRight size={14} />
            </span>
          </Card>
          <Card className="p-6" onClick={() => navigate('#/opportunities')}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-navy-800 mb-3 shadow-lg shadow-amber-400/40">
              <Rocket size={24} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('opportunities.title')}</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('opportunities.subtitle')}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-500">
              {t('common.readMore')} <ArrowRight size={14} />
            </span>
          </Card>
        </section>

        {/* Interactive features */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5" onClick={() => navigate('#/quiz')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-800 dark:text-navy-100 mb-2">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('quiz.title')}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('quiz.subtitle')}</p>
          </Card>
          <Card className="p-5" onClick={() => navigate('#/report')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-navy-800 mb-2 shadow-md shadow-amber-400/30">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('report.title')}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('report.subtitle')}</p>
          </Card>
          <Card className="p-5" onClick={() => navigate('#/checklist')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200 mb-2">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('checklist.title')}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('checklist.subtitle')}</p>
          </Card>
        </section>
      </div>
    </div>
  );
}
