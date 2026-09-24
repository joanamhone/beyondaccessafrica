/*
# Beyond Access Africa — Knowledge Hub Schema

## Summary
Creates the full data model for the Beyond Access Africa knowledge hub:
online-safety & digital-opportunity guides, interactive quizzes, user reports,
feedback, suggestions, newsletter signups, scam alerts, and lightweight page-view
analytics. This is a no-auth, single-tenant public site, so all tables are readable
and (where appropriate) writable by the anon role.

## New Tables
1. `guides` — the article library (15-20 guides). Holds pillar, category, tags,
   difficulty, read-time, language, body sections, featured flag, last-updated date,
   and a sources note.
2. `guide_categories` — normalized category list for browsing.
3. `guide_feedback` — per-guide "Was this helpful? Yes/No" + optional comment.
4. `quiz_questions` — questions for the "Spot the Scam" quiz and per-guide mini-quizzes.
5. `scam_reports` — user-submitted suspicious messages (anonymized by default).
6. `topic_suggestions` — "Suggest a topic / Contribute a guide" submissions.
7. `newsletter_signups` — email/WhatsApp signups for new-guide alerts.
8. `scam_alerts` — "This week's most reported scam" ticker items.
9. `page_views` — lightweight analytics: path, guide_id, timestamp, session id.

## Security
- RLS enabled on every table.
- All tables use `TO anon, authenticated` because the site has no sign-in screen
  and the anon-key frontend must be able to read public content and submit forms.
- Read access is public (`USING (true)`) for content tables.
- Write access (INSERT) is public for user-submission tables (feedback, reports,
  suggestions, signups, page_views) since these are intentionally open forms.
- UPDATE/DELETE are disabled on user-submission tables (no self-service editing).
- Guides/quiz/scam-alerts are read-only for anon (admin-managed content).

## Important Notes
1. No `user_id` / `auth.users` FK — this is a no-auth public site.
2. `USING (true)` is acceptable here because all content is intentionally public.
3. `page_views` stores an opaque session id (generated client-side) for unique-
   visitor counting; no PII.
4. All timestamps are `timestamptz DEFAULT now()`.
*/

-- ---------------------------------------------------------------------------
-- guide_categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guide_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('safety', 'opportunities')),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guide_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_guide_categories" ON guide_categories;
CREATE POLICY "anon_read_guide_categories" ON guide_categories
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- guides
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('safety', 'opportunities')),
  category_slug text REFERENCES guide_categories(slug) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'Beginner',
  read_time_minutes int NOT NULL DEFAULT 5,
  type text NOT NULL DEFAULT 'Article',
  language text NOT NULL DEFAULT 'en',
  summary text NOT NULL,
  real_world_example text,
  steps jsonb NOT NULL DEFAULT '[]',          -- array of {title, body}
  mini_quiz jsonb NOT NULL DEFAULT '[]',     -- array of {question, options[], answer_index, explanation}
  sources_note text,
  featured boolean NOT NULL DEFAULT false,
  featured_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  last_updated date NOT NULL DEFAULT CURRENT_DATE,
  cover_emoji text DEFAULT '🛡️',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_guides" ON guides;
CREATE POLICY "anon_read_guides" ON guides
  FOR SELECT TO anon, authenticated USING (published = true);

-- ---------------------------------------------------------------------------
-- guide_feedback
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guide_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES guides(id) ON DELETE CASCADE,
  helpful boolean NOT NULL,
  comment text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guide_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_guide_feedback" ON guide_feedback;
CREATE POLICY "anon_read_guide_feedback" ON guide_feedback
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_guide_feedback" ON guide_feedback;
CREATE POLICY "anon_insert_guide_feedback" ON guide_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- quiz_questions  (Spot the Scam standalone quiz)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_type text NOT NULL DEFAULT 'sms',  -- sms | email | job_ad | whatsapp
  prompt text NOT NULL,
  message_body text NOT NULL,
  is_real boolean NOT NULL,
  explanation text NOT NULL,
  warning_signs text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_read_quiz_questions" ON quiz_questions
  FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- scam_reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text,                 -- sms | email | whatsapp | call | other
  message_content text NOT NULL,
  reporter_notes text,
  consent boolean NOT NULL DEFAULT true,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_scam_reports" ON scam_reports;
CREATE POLICY "anon_insert_scam_reports" ON scam_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- topic_suggestions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topic_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  topic text NOT NULL,
  details text,
  is_contributor boolean NOT NULL DEFAULT false,
  organization text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topic_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_topic_suggestions" ON topic_suggestions;
CREATE POLICY "anon_insert_topic_suggestions" ON topic_suggestions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- newsletter_signups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact text NOT NULL,         -- email or whatsapp number
  channel text NOT NULL DEFAULT 'email',  -- email | whatsapp
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_newsletter_signups" ON newsletter_signups;
CREATE POLICY "anon_insert_newsletter_signups" ON newsletter_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- scam_alerts  (ticker / "this week's most reported scam")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scam_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',  -- low | medium | high
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scam_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_scam_alerts" ON scam_alerts;
CREATE POLICY "anon_read_scam_alerts" ON scam_alerts
  FOR SELECT TO anon, authenticated USING (active = true);

-- ---------------------------------------------------------------------------
-- page_views  (lightweight analytics)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  guide_id uuid REFERENCES guides(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views" ON page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guides_pillar ON guides(pillar);
CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category_slug);
CREATE INDEX IF NOT EXISTS idx_guides_featured ON guides(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_guide_feedback_guide ON guide_feedback(guide_id);
