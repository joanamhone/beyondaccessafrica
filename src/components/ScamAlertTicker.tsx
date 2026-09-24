import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase, type ScamAlert } from '@/lib/supabase';
import { fallbackScamAlerts } from '@/lib/fallback-data';
import { useTranslation } from '@/lib/i18n';

const TIMEOUT_MS = 3000;
function withTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
  ]);
}

export function ScamAlertTicker() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('scam_alerts')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(5)
        );
        if (error) throw error;
        if (!cancelled) setAlerts((data as ScamAlert[]) ?? []);
      } catch {
        if (!cancelled) setAlerts(fallbackScamAlerts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || alerts.length === 0) return null;

  const severityColor: Record<string, string> = {
    high: 'text-red-500',
    medium: 'text-amber-400',
    low: 'text-teal-500',
  };

  // Duplicate the alerts for seamless scroll
  const doubled = [...alerts, ...alerts];

  return (
    <div className="overflow-hidden border-y no-print" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 border-r" style={{ borderColor: 'var(--border-subtle)' }}>
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
            {t('home.scamAlertTitle')}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track flex gap-8 whitespace-nowrap py-2.5">
            {doubled.map((alert, i) => (
              <span key={i} className="text-xs flex items-center gap-2">
                <span className={`font-bold ${severityColor[alert.severity] ?? 'text-amber-400'}`}>
                  [{alert.severity.toUpperCase()}]
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{alert.title}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
