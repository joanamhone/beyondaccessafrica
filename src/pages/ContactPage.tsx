import { useState } from 'react';
import { Mail, CheckCircle2, Send, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';
import { useTranslation } from '@/lib/i18n';
import { Card, Button } from '@/components/ui';

export function ContactPage() {
  const { t } = useTranslation();
  const { sessionId } = useApp();

  // Suggestion form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [isContributor, setIsContributor] = useState(false);
  const [organization, setOrganization] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [suggestionError, setSuggestionError] = useState(false);

  // Newsletter form
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [newsletterError, setNewsletterError] = useState(false);

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setSubmitting(true);
    setSuggestionError(false);
    try {
      const { error } = await supabase.from('topic_suggestions').insert({
        name: name.trim() || null,
        email: email.trim() || null,
        topic: topic.trim(),
        details: details.trim() || null,
        is_contributor: isContributor,
        organization: organization.trim() || null,
      });
      if (error) throw error;
      setSuggestionSent(true);
    } catch {
      setSuggestionError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setNewsletterError(false);
    try {
      const { error } = await supabase.from('newsletter_signups').insert({
        contact: contact.trim(),
        channel,
      });
      if (error) throw error;
      setNewsletterSent(true);
    } catch {
      setNewsletterError(true);
    }
  };

  return (
    <div className="animate-fade-in px-6 py-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white">
          <Mail size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('contact.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('contact.subtitle')}</p>
        </div>
      </div>

      {/* Suggestion form */}
      <section>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('contact.suggestTitle')}</h2>
        {suggestionSent ? (
          <Card className="p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-3 bg-success-100 dark:bg-success-900">
              <CheckCircle2 size={28} className="text-success-400" />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('contact.success')}</p>
          </Card>
        ) : (
          <form onSubmit={handleSuggestion} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.topic')} *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.details')}</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isContributor}
                onChange={(e) => setIsContributor(e.target.checked)}
                className="accent-teal-500"
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('contact.contributor')}</span>
            </label>

            {isContributor && (
              <div>
                <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.organization')}</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            {suggestionError && <p className="text-sm text-red-500">{t('common.error')}</p>}

            <Button type="submit" variant="primary" disabled={submitting || !topic.trim()}>
              <Send size={14} className="inline mr-1" /> {submitting ? t('common.loading') : t('contact.submit')}
            </Button>
          </form>
        )}
      </section>

      {/* Newsletter signup */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Bell size={18} className="text-amber-400" />
          {t('contact.newsletterTitle')}
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{t('contact.newsletterSubtitle')}</p>
        {newsletterSent ? (
          <Card className="p-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-2 bg-success-100 dark:bg-success-900">
              <CheckCircle2 size={24} className="text-success-400" />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('contact.signupSuccess')}</p>
          </Card>
        ) : (
          <form onSubmit={handleNewsletter} className="space-y-3">
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('contact.contactMethod')}</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={channel === 'email' ? 'you@example.com' : '+265 999 12 34 56'}
                required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-teal-500 transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: channel === 'email' ? '#00B8B0' : 'var(--bg-card)',
                  color: channel === 'email' ? '#0B1F3B' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {t('contact.emailChannel')}
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: channel === 'whatsapp' ? '#00B8B0' : 'var(--bg-card)',
                  color: channel === 'whatsapp' ? '#0B1F3B' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {t('contact.whatsappChannel')}
              </button>
            </div>
            {newsletterError && <p className="text-sm text-red-500">{t('common.error')}</p>}
            <Button type="submit" variant="secondary" disabled={!contact.trim()}>
              {t('contact.signup')}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
