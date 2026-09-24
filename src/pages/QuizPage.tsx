import { useEffect, useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { supabase, type QuizQuestion } from '@/lib/supabase';
import { fallbackQuizQuestions } from '@/lib/fallback-data';
import { useApp } from '@/lib/app-context';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { LoadingSpinner, ErrorState, Card, Badge, Button } from '@/components/ui';

const TIMEOUT_MS = 3000;
function withTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
  ]);
}

export function QuizPage() {
  const { t } = useTranslation();
  const { sessionId, setPageLoading } = useApp();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<'real' | 'fake' | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: e } = await withTimeout(
          supabase
            .from('quiz_questions')
            .select('*')
            .order('created_at', { ascending: true })
        );
        if (e) throw e;
        if (!cancelled) {
          setQuestions((data as QuizQuestion[]) ?? []);
          await import('@/lib/api').then((m) => m.trackPageView('/quiz', sessionId));
        }
      } catch {
        if (!cancelled) { setError(true); setQuestions(fallbackQuizQuestions); }
      } finally {
        if (!cancelled) { setLoading(false); setPageLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  const handleAnswer = (choice: 'real' | 'fake') => {
    if (answered) return;
    setAnswered(choice);
    const question = questions[current];
    const correct = (choice === 'real' && question.is_real) || (choice === 'fake' && !question.is_real);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setAnswered(null);
    }
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setAnswered(null);
    setScore(0);
  };

  if (loading) return <LoadingSpinner />;
  if (error && questions.length === 0) return <ErrorState onRetry={() => window.location.reload()} />;

  // Landing screen
  if (!started) {
    return (
      <div className="animate-fade-in px-6 py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 dark:bg-navy-700 text-navy-800 dark:text-navy-100">
            <HelpCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('quiz.title')}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{questions.length} {t('quiz.question').toLowerCase()}s</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{t('quiz.subtitle')}</p>
        <Card className="p-5 mb-6">
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How it works</h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start gap-2"><span className="text-teal-500">1.</span> You'll see a message (SMS, email, WhatsApp, or job ad).</li>
            <li className="flex items-start gap-2"><span className="text-teal-500">2.</span> Decide: is it <span className="font-bold text-success-400">Real</span> or a <span className="font-bold text-red-500">Scam</span>?</li>
            <li className="flex items-start gap-2"><span className="text-teal-500">3.</span> Get instant feedback with an explanation and warning signs.</li>
          </ul>
        </Card>
        <Button onClick={() => setStarted(true)} variant="primary">
          {t('quiz.start')} <ArrowRight size={14} className="inline ml-1" />
        </Button>
      </div>
    );
  }

  // Quiz complete
  if (current >= questions.length - 1 && answered) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="animate-fade-in px-6 py-12 max-w-2xl mx-auto text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full mx-auto mb-4"
          style={{ backgroundColor: pct >= 70 ? 'rgba(46, 204, 113, 0.15)' : pct >= 40 ? 'rgba(244, 180, 0, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
          {pct >= 70 ? <CheckCircle2 size={40} className="text-success-400" /> : <AlertTriangle size={40} className="text-amber-400" />}
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('quiz.score')}</h2>
        <div className="text-4xl font-bold mb-2" style={{ color: pct >= 70 ? '#2ECC71' : pct >= 40 ? '#F4B400' : '#ef4444' }}>
          {score} / {questions.length}
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {pct >= 70 ? 'Great job! You can spot scams well.' : pct >= 40 ? 'Good start — review the guides to improve.' : 'Keep learning! Check out the Safety Hub guides.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={restart} variant="secondary">
            <RotateCcw size={14} className="inline mr-1" /> {t('quiz.restart')}
          </Button>
          <Button onClick={() => navigate('#/safety')} variant="primary">
            {t('nav.safety')}
          </Button>
        </div>
      </div>
    );
  }

  // Active question
  const q = questions[current];
  if (!q) return null;

  const scenarioLabels: Record<string, string> = {
    sms: 'SMS', email: 'Email', job_ad: 'Job Ad', whatsapp: 'WhatsApp', call: 'Phone Call',
  };

  return (
    <div className="animate-fade-in px-6 py-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t('quiz.question')} {current + 1} {t('quiz.of')} {questions.length}
        </span>
        <Badge color="surface">{scenarioLabels[q.scenario_type] ?? q.scenario_type}</Badge>
      </div>
      <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      {/* Prompt */}
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{q.prompt}</p>

      {/* Message body */}
      <Card className="p-4 mb-5 font-mono text-sm whitespace-pre-wrap leading-relaxed"
        style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
      >
        {q.message_body}
      </Card>

      {/* Answer buttons */}
      {!answered ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer('real')}
            className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 transition-all hover:border-success-400 hover:bg-success-50 dark:hover:bg-success-900"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <CheckCircle2 size={28} className="text-success-400" />
            <span className="font-bold">{t('quiz.real')}</span>
          </button>
          <button
            onClick={() => handleAnswer('fake')}
            className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 transition-all hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <XCircle size={28} className="text-red-500" />
            <span className="font-bold">{t('quiz.fake')}</span>
          </button>
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          {/* Result banner */}
          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
              backgroundColor: (answered === 'real' && q.is_real) || (answered === 'fake' && !q.is_real)
                ? 'rgba(46, 204, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${(answered === 'real' && q.is_real) || (answered === 'fake' && !q.is_real) ? '#2ECC71' : '#ef4444'}`,
            }}
          >
            {(answered === 'real' && q.is_real) || (answered === 'fake' && !q.is_real)
              ? <CheckCircle2 size={24} className="text-success-400 shrink-0" />
              : <XCircle size={24} className="text-red-500 shrink-0" />}
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {(answered === 'real' && q.is_real) || (answered === 'fake' && !q.is_real) ? t('quiz.correct') : t('quiz.wrong')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                This message is <span className="font-bold">{q.is_real ? t('quiz.real').toLowerCase() : t('quiz.fake').toLowerCase()}</span>.
              </p>
            </div>
          </div>

          {/* Explanation */}
          <Card className="p-4">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('quiz.explanation')}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.explanation}</p>
          </Card>

          {/* Warning signs */}
          {!q.is_real && q.warning_signs.length > 0 && (
            <Card className="p-4">
              <p className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle size={14} className="text-amber-400" /> {t('quiz.warningSigns')}
              </p>
              <ul className="space-y-1.5">
                {q.warning_signs.map((sign, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-amber-400 mt-0.5">•</span> {sign}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Next button */}
          <Button onClick={nextQuestion} variant="primary" className="w-full">
            {t('quiz.next')} <ArrowRight size={14} className="inline ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
