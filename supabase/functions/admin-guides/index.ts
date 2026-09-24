import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');
if (!ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_PASSWORD environment variable');
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/admin-guides', '');

    // Auth check: all requests must include the admin password
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.slice(7);
    if (token !== ADMIN_PASSWORD) {
      return json({ error: 'Invalid credentials' }, 403);
    }

    // GET / — list all guides (including unpublished)
    if (req.method === 'GET' && (path === '' || path === '/')) {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json({ guides: data });
    }

    // GET /categories — list categories
    if (req.method === 'GET' && (path === '/categories' || path === 'categories')) {
      const { data, error } = await supabase
        .from('guide_categories')
        .select('*')
        .order('name');
      if (error) return json({ error: error.message }, 500);
      return json({ categories: data });
    }

    // POST / — create a new guide
    if (req.method === 'POST' && (path === '' || path === '/')) {
      const body = await req.json();
      const { data, error } = await supabase
        .from('guides')
        .insert(body)
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ guide: data });
    }

    // PUT /:id — update a guide
    if (req.method === 'PUT') {
      const id = path.replace('/', '');
      const body = await req.json();
      const { data, error } = await supabase
        .from('guides')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ guide: data });
    }

    // DELETE /:id — delete a guide
    if (req.method === 'DELETE') {
      const id = path.replace('/', '');
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
