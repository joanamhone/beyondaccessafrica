import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: { headers: { 'X-Client-Info': 'beyond-access-africa' } },
});

export type Guide = {
  id: string;
  slug: string;
  title: string;
  pillar: 'safety' | 'opportunities';
  category_slug: string | null;
  tags: string[];
  difficulty: string;
  read_time_minutes: number;
  type: string;
  language: string;
  summary: string;
  real_world_example: string | null;
  steps: { title: string; body: string }[];
  mini_quiz: {
    question: string;
    options: string[];
    answer_index: number;
    explanation: string;
  }[];
  sources_note: string | null;
  featured: boolean;
  featured_order: number;
  published: boolean;
  last_updated: string;
  cover_emoji: string;
  created_at: string;
};

export type GuideCategory = {
  id: string;
  slug: string;
  name: string;
  pillar: 'safety' | 'opportunities';
  description: string | null;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  scenario_type: string;
  prompt: string;
  message_body: string;
  is_real: boolean;
  explanation: string;
  warning_signs: string[];
  created_at: string;
};

export type ScamAlert = {
  id: string;
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high';
  active: boolean;
  created_at: string;
};

export type GuideFeedback = {
  id: string;
  guide_id: string;
  helpful: boolean;
  comment: string | null;
  session_id: string | null;
  created_at: string;
};
