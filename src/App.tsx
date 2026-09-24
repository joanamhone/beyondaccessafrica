import { AppProvider, useApp } from '@/lib/app-context';
import { useRouter, type Route } from '@/lib/router';
import { useTranslation } from '@/lib/i18n';
import { Sidebar, MobileTopBar, useSidebarState } from '@/components/Sidebar';
import { HomePage } from '@/pages/HomePage';
import { HubPage } from '@/pages/HubPage';
import { GuideDetailPage } from '@/pages/GuideDetailPage';
import { QuizPage } from '@/pages/QuizPage';
import { ReportPage } from '@/pages/ReportPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminPage } from '@/pages/AdminPage';
import { ShieldCheck, Mail, Globe, ArrowRight } from 'lucide-react';

function PageView({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'safety':
      return <HubPage pillar="safety" />;
    case 'opportunities':
      return <HubPage pillar="opportunities" />;
    case 'guide':
      return <GuideDetailPage slug={route.slug} />;
    case 'quiz':
      return <QuizPage />;
    case 'report':
      return <ReportPage />;
    case 'checklist':
      return <ChecklistPage />;
    case 'contact':
      return <ContactPage />;
    case 'admin':
      return <AdminPage />;
  }
}

function Footer() {
  const { t } = useTranslation();

  const linkSections = [
    {
      title: t('nav.safety'),
      links: [
        { label: 'Mobile Money Fraud', hash: '#/guide/mobile-money-fraud' },
        { label: 'Phishing Messages', hash: '#/guide/phishing-messages' },
        { label: 'Fake Job Ads', hash: '#/guide/fake-job-ads' },
        { label: 'Identity Theft', hash: '#/guide/identity-theft' },
      ],
    },
    {
      title: t('nav.opportunities'),
      links: [
        { label: 'Remote Work Guide', hash: '#/guide/remote-work-guide' },
        { label: 'Freelancing Guide', hash: '#/guide/freelancing-guide' },
        { label: 'Online Learning', hash: '#/guide/online-learning' },
        { label: 'Digital Entrepreneurship', hash: '#/guide/digital-entrepreneurship' },
      ],
    },
    {
      title: 'Tools',
      links: [
        { label: t('quiz.title'), hash: '#/quiz' },
        { label: t('report.title'), hash: '#/report' },
        { label: t('checklist.title'), hash: '#/checklist' },
        { label: t('contact.title'), hash: '#/contact' },
      ],
    },
  ];

  return (
    <footer className="mt-12 border-t no-print" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
      <div className="px-6 py-10 max-w-5xl mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Beyond Access Africa
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              {t('footer.tagline')}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('footer.fellowship')}
            </p>
          </div>

          {/* Link sections */}
          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-primary)' }}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.hash}
                      className="text-xs transition-colors hover:text-teal-500 flex items-center gap-1 group"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#/contact" className="flex items-center gap-1.5 text-xs transition-colors hover:text-teal-500" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={12} /> Contact
            </a>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>|</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Globe size={12} /> English
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppShell() {
  const route = useRouter();
  const { mobileOpen, openMobile, closeMobile } = useSidebarState();
  const { pageLoading } = useApp();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Sidebar route={route} mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="md:pl-64">
        <MobileTopBar onOpenSidebar={openMobile} />
        <main className="min-h-[calc(100vh-0px)]">
          <PageView route={route} />
          {!pageLoading && <Footer />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
