import {
  Smartphone, Fish, Briefcase, Lock, Users, Newspaper,
  Laptop, Rocket, BookOpen, Store, Search, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

const slugIconMap: Record<string, LucideIcon> = {
  'mobile-money-fraud': Smartphone,
  'phishing-messages': Fish,
  'fake-job-ads': Briefcase,
  'identity-theft': Lock,
  'social-media-safety': Users,
  'misinformation': Newspaper,
  'remote-work-guide': Laptop,
  'freelancing-guide': Rocket,
  'online-learning': BookOpen,
  'digital-entrepreneurship': Store,
  'spotting-legitimate-opportunity': Search,
};

const pillarFallback: Record<string, LucideIcon> = {
  safety: ShieldCheck,
  opportunities: Rocket,
};

export function getGuideIcon(slug: string, pillar: string): LucideIcon {
  return slugIconMap[slug] ?? pillarFallback[pillar] ?? ShieldCheck;
}
