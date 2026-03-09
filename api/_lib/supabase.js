const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  return { supabaseUrl, serviceRoleKey };
}

export async function supabaseRequest(path, { method = 'GET', query = '', body } = {}) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const url = `${supabaseUrl}/rest/v1/${path}${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}
