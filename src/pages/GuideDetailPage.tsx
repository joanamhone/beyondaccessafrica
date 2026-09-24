import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Printer, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Tag, ExternalLink } from 'lucide-react';
import { fetchGuideBySlug } from '@/lib/api';
import type { Guide } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { getGuideIcon } from '@/lib/guide-icons';
import { LoadingSpinner, ErrorState, Card, Badge, Button } from '@/components/ui';

export function GuideDetailPage({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { sessionId, setPageLoading } = useApp();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState<Record<number, boolean>>({});
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPageLoading(true);
      setError(false);
      try {
        const g = await fetchGuideBySlug(slug);
        if (cancelled) return;
        setGuide(g);
        if (g) {
          await import('@/lib/api').then((m) => m.trackPageView(`/guide/${slug}`, sessionId, g.id));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) { setLoading(false); setPageLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [slug, sessionId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: guide?.title, url });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  const submitFeedback = async (helpful: boolean) => {
    if (!guide) return;
    setFeedbackGiven(helpful);
    try {
      await supabase.from('guide_feedback').insert({
        guide_id: guide.id,
        helpful,
        session_id: sessionId,
      });
    } catch {
      // silent
    }
  };

  const submitFeedbackComment = async () => {
    if (!guide || feedbackGiven === null) return;
    try {
      await supabase.from('guide_feedback').insert({
        guide_id: guide.id,
        helpful: feedbackGiven,
        comment: feedbackComment.trim() || null,
        session_id: sessionId,
      });
    } catch {
      // silent
    }
    setFeedbackSubmitted(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (!guide) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Guide not found.</p>
        <Button onClick={() => navigate('#/home')} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const pillarColor = guide.pillar === 'safety' ? 'teal' : 'amber';

  return (
    <div className="animate-fade-in px-6 py-8 max-w-3xl mx-auto print-full-width">
      {/* Back link */}
      <button
        onClick={() => navigate(guide.pillar === 'safety' ? '#/safety' : '#/opportunities')}
        className="flex items-center gap-2 text-sm mb-4 no-print"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> {t('common.backToHub')}
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${guide.pillar === 'opportunities' ? 'bg-amber-400 text-navy-800 shadow-md shadow-amber-400/30' : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300'}`}>
            {(() => {
              const Icon = getGuideIcon(guide.slug, guide.pillar);
              return <Icon size={28} strokeWidth={1.75} />;
            })()}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge color={pillarColor as 'teal' | 'amber'}>{guide.pillar === 'safety' ? t('safety.title') : t('opportunities.title')}</Badge>
            <Badge color="surface">{guide.difficulty}</Badge>
            <Badge color="surface"><Clock size={10} /> {guide.read_time_minutes} {t('common.minRead')}</Badge>
            {guide.type !== 'Article' && <Badge color="surface">{guide.type}</Badge>}
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {guide.title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {t('common.lastUpdated')}: {new Date(guide.last_updated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6 no-print">
        <Button onClick={handleShare} variant="secondary" className="!py-2 !px-4">
          <Share2 size={14} className="inline mr-1" /> {shared ? 'Copied!' : t('common.share')}
        </Button>
        <Button onClick={() => window.print()} variant="secondary" className="!py-2 !px-4">
          <Printer size={14} className="inline mr-1" /> {t('common.print')}
        </Button>
      </div>

      {/* Problem summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('guide.problemSummary')}</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{guide.summary}</p>
      </section>

      {/* Real world example */}
      {guide.real_world_example && (
        <section className="mb-6">
          <Card className="p-5">
            <div style={{ borderLeft: '4px solid #F4B400', paddingLeft: '20px', marginLeft: '-20px', marginTop: '-20px', marginBottom: '-20px', paddingTop: '20px', paddingBottom: '20px' }}>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Tag size={16} className="text-amber-400" /> {t('guide.realWorldExample')}
              </h2>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                {guide.real_world_example}
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* Protection tips */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('guide.protectionTips')}</h2>
        <div className="space-y-3">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mini quiz */}
      {guide.mini_quiz.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('guide.testYourself')}</h2>
          <div className="space-y-4">
            {guide.mini_quiz.map((q, qi) => {
              const selected = quizAnswers[qi];
              const checked = quizChecked[qi];
              return (
                <Card key={qi} className="p-5">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isCorrect = oi === q.answer_index;
                      let style: React.CSSProperties = {
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      };
                      if (checked && isSelected && isCorrect) {
                        style = { border: '2px solid #2ECC71', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: 'var(--text-primary)' };
                      } else if (checked && isSelected && !isCorrect) {
                        style = { border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)' };
                      } else if (checked && isCorrect) {
                        style = { border: '2px solid #2ECC71', backgroundColor: 'rgba(46, 204, 113, 0.05)', color: 'var(--text-primary)' };
                      } else if (isSelected) {
                        style = { border: '2px solid #00B8B0', backgroundColor: 'rgba(0, 184, 176, 0.05)', color: 'var(--text-primary)' };
                      }
                      return (
                        <button
                          key={oi}
                          disabled={checked}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                          className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all disabled:cursor-default flex items-center gap-2"
                          style={style}
                        >
                          {checked && isCorrect && <CheckCircle2 size={16} className="text-success-400 shrink-0" />}
                          {checked && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== undefined && !checked && (
                    <Button onClick={() => setQuizChecked((prev) => ({ ...prev, [qi]: true }))} className="mt-3 !py-2" variant="primary">
                      {t('guide.checkAnswer')}
                    </Button>
                  )}
                  {checked && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-sm font-bold mb-1" style={{ color: selected === q.answer_index ? '#2ECC71' : '#ef4444' }}>
                        {selected === q.answer_index ? t('guide.correct') : t('guide.incorrect')}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-bold">{t('guide.explanation')}: </span>{q.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Sources */}
      {guide.sources_note && (
        <section className="mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <ExternalLink size={14} /> {t('common.sources')}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{guide.sources_note}</p>
          </Card>
        </section>
      )}

      {/* Feedback widget */}
      <section className="mb-6 no-print">
        <Card className="p-5">
          {!feedbackSubmitted ? (
            <>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{t('common.wasThisHelpful')}</p>
              {feedbackGiven === null ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => submitFeedback(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:border-success-400"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ThumbsUp size={16} className="text-success-400" /> {t('common.yes')}
                  </button>
                  <button
                    onClick={() => submitFeedback(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:border-red-400"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ThumbsDown size={16} className="text-red-500" /> {t('common.no')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.thankYou')}</p>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={t('common.commentOptional')}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <Button onClick={submitFeedbackComment} variant="primary" className="!py-2">{t('common.submit')}</Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.thankYou')}</p>
          )}
        </Card>
      </section>

      {/* Tags */}
      {guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 no-print">
          {guide.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(guide.pillar === 'safety' ? '#/safety' : '#/opportunities')}
              className="text-xs px-2.5 py-1 rounded-full transition-colors hover:bg-teal-50 dark:hover:bg-teal-900"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
