import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'safety' }
  | { name: 'opportunities' }
  | { name: 'guide'; slug: string }
  | { name: 'quiz' }
  | { name: 'report' }
  | { name: 'checklist' }
  | { name: 'contact' }
  | { name: 'admin' };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean || clean === 'home' || clean === 'about') return { name: 'home' };
  if (clean === 'safety') return { name: 'safety' };
  if (clean === 'opportunities') return { name: 'opportunities' };
  if (clean === 'quiz') return { name: 'quiz' };
  if (clean === 'report') return { name: 'report' };
  if (clean === 'checklist') return { name: 'checklist' };
  if (clean === 'contact') return { name: 'contact' };
  if (clean === 'admin') return { name: 'admin' };
  if (clean.startsWith('guide/')) {
    return { name: 'guide', slug: clean.slice(5) };
  }
  return { name: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/home';
    case 'safety': return '#/safety';
    case 'opportunities': return '#/opportunities';
    case 'guide': return `#/guide/${route.slug}`;
    case 'quiz': return '#/quiz';
    case 'report': return '#/report';
    case 'checklist': return '#/checklist';
    case 'contact': return '#/contact';
    case 'admin': return '#/admin';
  }
}
