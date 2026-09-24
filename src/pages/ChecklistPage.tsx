import { useState } from 'react';
import { ListChecks, RotateCcw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { Card, Button, Badge } from '@/components/ui';

type ChecklistItem = {
  id: string;
  question: string;
  yesIsRisk: boolean; // true = answering "yes" is a risk sign
};

const checklistItems: ChecklistItem[] = [
  { id: 'money', question: 'Does the job or opportunity ask you to pay money upfront (registration, training, or equipment fee)?', yesIsRisk: true },
  { id: 'company', question: 'Can you find the company name on Google with a real website and real employees on LinkedIn?', yesIsRisk: false },
  { id: 'income', question: 'Does it promise very high income with no experience needed (e.g. "earn MK 200,000/week")?', yesIsRisk: true },
  { id: 'verify', question: 'Can you verify the opportunity through an official platform (Upwork, Fiverr, company website)?', yesIsRisk: false },
  { id: 'contact', question: 'Is the only contact a WhatsApp number or personal phone (no official email or website)?', yesIsRisk: true },
  { id: 'pressure', question: 'Does the message create urgency or pressure ("only 5 spots left", "act now")?', yesIsRisk: true },
  { id: 'details', question: 'Is there a clear job description with tasks, hours, and realistic pay?', yesIsRisk: false },
  { id: 'personal', question: 'Do they ask for sensitive personal information (ID copy, bank PIN, passwords)?', yesIsRisk: true },
];

export function ChecklistPage() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const allAnswered = checklistItems.every((item) => answers[item.id] !== undefined && answers[item.id] !== null);

  const riskScore = checklistItems.reduce((score, item) => {
    const ans = answers[item.id];
    if (ans === undefined || ans === null) return score;
    if (item.yesIsRisk && ans === true) return score + 1;
    if (!item.yesIsRisk && ans === false) return score + 1;
    return score;
  }, 0);

  const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';

  const restart = () => {
    setAnswers({});
    setShowResult(false);
  };

  const riskConfig = {
    low: { color: '#2ECC71', bg: 'rgba(46, 204, 113, 0.1)', icon: CheckCircle2, label: t('checklist.low'), message: t('checklist.legitimate') },
    medium: { color: '#F4B400', bg: 'rgba(244, 180, 0, 0.1)', icon: AlertTriangle, label: t('checklist.medium'), message: t('checklist.proceed') },
    high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle, label: t('checklist.high'), message: t('checklist.likelyScam') },
  };

  const config = riskConfig[riskLevel];
  const RiskIcon = config.icon;

  return (
    <div className="animate-fade-in px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-400 text-white">
          <ListChecks size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('checklist.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('checklist.subtitle')}</p>
        </div>
      </div>

      {showResult ? (
        <div className="animate-fade-in space-y-4">
          {/* Result banner */}
          <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: config.bg, border: `2px solid ${config.color}` }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-3" style={{ backgroundColor: config.bg }}>
              <RiskIcon size={32} style={{ color: config.color }} />
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: config.color }}>{config.label}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{config.message}</p>
            <div className="mt-3 text-3xl font-bold" style={{ color: config.color }}>
              {riskScore} / {checklistItems.length}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>risk factors identified</p>
          </div>

          {/* Summary of answers */}
          <Card className="p-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Your answers</h3>
            <ul className="space-y-2">
              {checklistItems.map((item) => {
                const ans = answers[item.id];
                const isRisk = (item.yesIsRisk && ans === true) || (!item.yesIsRisk && ans === false);
                return (
                  <li key={item.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5">
                      {isRisk ? <XCircle size={14} className="text-red-500 shrink-0" /> : <CheckCircle2 size={14} className="text-success-400 shrink-0" />}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-bold">{item.question}</span> — {ans ? t('checklist.yes') : t('checklist.no')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button onClick={restart} variant="secondary">
              <RotateCcw size={14} className="inline mr-1" /> {t('checklist.restart')}
            </Button>
            <Button onClick={() => navigate('#/safety')} variant="primary">
              {t('nav.safety')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {checklistItems.map((item, i) => {
            const ans = answers[item.id];
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.question}</p>
                </div>
                <div className="flex gap-2 ml-8">
                  <button
                    onClick={() => handleAnswer(item.id, true)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: ans === true ? '#00B8B0' : 'var(--bg-card)',
                      color: ans === true ? '#0B1F3B' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {t('checklist.yes')}
                  </button>
                  <button
                    onClick={() => handleAnswer(item.id, false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: ans === false ? '#00B8B0' : 'var(--bg-card)',
                      color: ans === false ? '#0B1F3B' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {t('checklist.no')}
                  </button>
                </div>
              </Card>
            );
          })}

          <Button
            onClick={() => setShowResult(true)}
            variant="primary"
            disabled={!allAnswered}
            className="w-full"
          >
            {allAnswered ? t('checklist.result') : `Answer all questions (${Object.values(answers).filter((v) => v !== null && v !== undefined).length}/${checklistItems.length})`}
          </Button>
        </div>
      )}
    </div>
  );
}
