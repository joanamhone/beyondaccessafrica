import { supabase } from './supabase';
import type { Guide } from './supabase';
import { fallbackGuides } from './fallback-data';

const TIMEOUT_MS = 3000;

function withTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    ),
  ]);
}

export async function trackPageView(path: string, sessionId: string, guideId?: string) {
  try {
    await withTimeout(supabase.from('page_views').insert({
      path,
      guide_id: guideId ?? null,
      session_id: sessionId,
    }));
  } catch {
    // analytics should never break the page
  }
}

export async function fetchGuides(pillar?: string): Promise<Guide[]> {
  try {
    let query = supabase
      .from('guides')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (pillar) query = query.eq('pillar', pillar);
    const { data, error } = await withTimeout(query);
    if (error) throw error;
    return (data as Guide[]) ?? [];
  } catch {
    return fallbackGuides.filter((g) => !pillar || g.pillar === pillar);
  }
}

export async function fetchGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('guides')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle()
    );
    if (error) throw error;
    return data as Guide | null;
  } catch {
    return fallbackGuides.find((g) => g.slug === slug) ?? null;
  }
}

export async function fetchFeaturedGuides(): Promise<Guide[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('guides')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('featured_order', { ascending: true })
    );
    if (error) throw error;
    return (data as Guide[]) ?? [];
  } catch {
    return fallbackGuides.filter((g) => g.featured).sort((a, b) => a.featured_order - b.featured_order);
  }
}

export async function fetchGuideCount(): Promise<{ published: number; total: number }> {
  try {
    const { count: published, error } = await withTimeout(
      supabase
        .from('guides')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
    );
    if (error) throw error;
    return { published: published ?? 0, total: 20 };
  } catch {
    return { published: fallbackGuides.length, total: 20 };
  }
}
