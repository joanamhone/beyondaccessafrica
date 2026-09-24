import { Clock, Tag } from 'lucide-react';
import type { Guide } from '@/lib/supabase';
import { Badge, Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { getGuideIcon } from '@/lib/guide-icons';

export function GuideCard({ guide }: { guide: Guide }) {
  const { t } = useTranslation();
  const Icon = getGuideIcon(guide.slug, guide.pillar);
  const isOpportunity = guide.pillar === 'opportunities';

  const difficultyColor = (d: string) => {
    if (d === 'Beginner') return 'success';
    if (d === 'Intermediate') return 'amber';
    return 'navy';
  };

  return (
    <Card
      onClick={() => navigate(`#/guide/${guide.slug}`)}
      className="p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${isOpportunity ? 'bg-amber-400 text-navy-800 shadow-md shadow-amber-400/30' : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300'}`}>
          <Icon size={24} strokeWidth={1.75} />
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <Badge color={difficultyColor(guide.difficulty) as 'success' | 'amber' | 'navy'}>{guide.difficulty}</Badge>
          <Badge color="surface">
            <Clock size={10} /> {guide.read_time_minutes} {t('common.minRead')}
          </Badge>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold leading-snug group-hover:text-teal-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {guide.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {guide.summary}
        </p>
      </div>

      {guide.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={12} style={{ color: 'var(--text-secondary)' }} />
          {guide.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs pt-2 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
        {t('common.lastUpdated')}: {new Date(guide.last_updated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </Card>
  );
}
