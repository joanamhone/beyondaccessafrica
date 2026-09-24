import type { ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-teal-500" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <AlertTriangle size={32} className="text-amber-400" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message ?? t('common.error')}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            {t('common.tryAgain')}
          </button>
        )}
      </div>
    </div>
  );
}

export function Card({ children, className = '', onClick, style }: { children: ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all ${onClick ? 'cursor-pointer hover:border-teal-500 hover:shadow-lg' : ''} ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', ...style }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = 'teal' }: { children: ReactNode; color?: 'teal' | 'amber' | 'success' | 'navy' | 'surface' }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    success: 'bg-success-50 text-success-700 dark:bg-success-900 dark:text-success-200',
    navy: 'bg-navy-50 text-navy-700 dark:bg-navy-700 dark:text-navy-100',
    surface: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'amber' | 'success' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600',
    secondary: 'border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900',
    amber: 'bg-amber-400 text-navy-800 hover:bg-amber-500',
    success: 'bg-success-400 text-white hover:bg-success-500',
    ghost: 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{children}</h2>
      {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
  );
}
