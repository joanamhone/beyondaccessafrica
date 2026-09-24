import { useState } from 'react';
import {
  Home,
  ShieldCheck,
  Rocket,
  HelpCircle,
  Flag,
  ListChecks,
  Mail,
  Moon,
  Sun,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTranslation } from '@/lib/i18n';
import { navigate, type Route } from '@/lib/router';

type NavItem = {
  label: string;
  icon: typeof Home;
  route: Route;
  active: (r: Route) => boolean;
};

export function Sidebar({
  route,
  mobileOpen,
  onCloseMobile,
}: {
  route: Route;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { theme, toggleTheme } = useApp();
  const { t } = useTranslation();

  const items: NavItem[] = [
    { label: t('nav.home'), icon: Home, route: { name: 'home' }, active: (r) => r.name === 'home' },
    { label: t('nav.safety'), icon: ShieldCheck, route: { name: 'safety' }, active: (r) => r.name === 'safety' || r.name === 'guide' && false },
    { label: t('nav.opportunities'), icon: Rocket, route: { name: 'opportunities' }, active: (r) => r.name === 'opportunities' },
    { label: t('nav.quiz'), icon: HelpCircle, route: { name: 'quiz' }, active: (r) => r.name === 'quiz' },
    { label: t('nav.report'), icon: Flag, route: { name: 'report' }, active: (r) => r.name === 'report' },
    { label: t('nav.checklist'), icon: ListChecks, route: { name: 'checklist' }, active: (r) => r.name === 'checklist' },
    { label: t('nav.contact'), icon: Mail, route: { name: 'contact' }, active: (r) => r.name === 'contact' },
  ];

  const handleNav = (r: Route) => {
    navigate(
      r.name === 'home' ? '#/home' :
      r.name === 'safety' ? '#/safety' :
      r.name === 'opportunities' ? '#/opportunities' :
      r.name === 'quiz' ? '#/quiz' :
      r.name === 'report' ? '#/report' :
      r.name === 'checklist' ? '#/checklist' :
      r.name === 'contact' ? '#/contact' :
      '#/admin'
    );
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--bg-sidebar-hover)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-on-sidebar)' }}>
            Beyond Access
          </div>
          <div className="text-xs leading-tight" style={{ color: 'var(--text-on-sidebar-muted)' }}>
            Africa
          </div>
        </div>
        <button
          className="ml-auto md:hidden text-white p-1"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = item.active(route);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.route)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: active ? 'var(--bg-sidebar-hover)' : 'transparent',
                color: active ? '#00B8B0' : 'var(--text-on-sidebar)',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} className="shrink-0" style={{ color: active ? '#00B8B0' : 'var(--text-on-sidebar-muted)' }} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'var(--bg-sidebar-hover)' }}>
        {/* Admin link */}
        <button
          onClick={() => { navigate('#/admin'); onCloseMobile(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'var(--text-on-sidebar)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Lock size={18} style={{ color: 'var(--text-on-sidebar-muted)' }} />
          <span className="flex-1 text-left truncate">Admin</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'var(--text-on-sidebar)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#F4B400' }} /> : <Moon size={18} style={{ color: 'var(--text-on-sidebar-muted)' }} />}
          <span className="flex-1 text-left truncate">
            {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          </span>
          <div
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ backgroundColor: theme === 'dark' ? '#00B8B0' : 'var(--bg-sidebar-hover)' }}
          >
            <div
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
              style={{ transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-30 shrink-0"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <aside
            className="absolute left-0 top-0 h-full w-72 animate-slide-in-right"
            style={{ backgroundColor: 'var(--bg-sidebar)' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function MobileTopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b no-print"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <button onClick={onOpenSidebar} aria-label="Open menu" className="p-1">
        <Menu size={22} style={{ color: 'var(--text-primary)' }} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white">
          <ShieldCheck size={16} />
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Beyond Access Africa</span>
      </div>
    </div>
  );
}

export function useSidebarState() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return {
    mobileOpen,
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
  };
}
