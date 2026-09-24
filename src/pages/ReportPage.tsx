import { useState } from 'react';
import { Flag, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';
import { useTranslation } from '@/lib/i18n';
import { Card, Button, Badge } from '@/components/ui';

export function ReportPage() {
  const { t } = useTranslation();
  const { sessionId } = useApp();
  const [channel, setChannel] = useState('sms');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !consent) return;
    setSubmitting(true);
    setError(false);
    try {
      const result = await Promise.race([
        supabase.from('scam_reports').insert({
          channel,
          message_content: message.trim(),
          reporter_notes: notes.trim() || null,
          consent,
          session_id: sessionId,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        ),
      ]);
      if (result.error) throw result.error;
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade-in px-6 py-12 max-w-2xl mx-auto text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full mx-auto mb-4 bg-success-100 dark:bg-success-900">
          <CheckCircle2 size={40} className="text-success-400" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('report.success')}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('report.anonymized')}</p>
        <Button onClick={() => { setSubmitted(false); setMessage(''); setNotes(''); }} variant="secondary">
          {t('report.submit')} — {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  const channels = [
    { id: 'sms', label: 'SMS' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'call', label: 'Phone Call' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="animate-fade-in px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-navy-800">
          <Flag size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('report.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('report.subtitle')}</p>
        </div>
      </div>

      <Card className="p-3 mb-4 flex items-start gap-2">
        <Shield size={16} className="text-teal-500 shrink-0 mt-0.5" />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('report.anonymized')}</p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Channel */}
        <div>
          <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-primary)' }}>{t('report.channel')}</label>
          <div className="flex flex-wrap gap-2">
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: channel === ch.id ? '#00B8B0' : 'var(--bg-card)',
                  color: channel === ch.id ? '#0B1F3B' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-primary)' }}>{t('report.message')}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('report.messagePlaceholder')}
            rows={6}
            required
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-teal-500 transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-primary)' }}>{t('report.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('report.notesPlaceholder')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-teal-500 transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Consent */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-teal-500"
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('report.consent')}</span>
        </label>

        {error && (
          <p className="text-sm text-red-500">{t('common.error')}</p>
        )}

        <Button type="submit" variant="amber" disabled={submitting || !message.trim() || !consent}>
          {submitting ? t('common.loading') : t('report.submit')}
        </Button>
      </form>
    </div>
  );
}
