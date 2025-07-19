import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getTracking() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tracking?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addTracking(body: any) {
  const payload = {
    entity_type: typeof body.entity_type === 'string' && body.entity_type.trim() ? body.entity_type.trim() : null,
    entity_id: typeof body.entity_id === 'string' && body.entity_id.trim() ? body.entity_id.trim() : null,
    action: typeof body.action === 'string' && body.action.trim() ? body.action.trim() : null,
    details: body.details ?? null,
  };
  if (!payload.entity_type || !payload.entity_id || !payload.action) {
    return { error: 'Entity type, entity id, and action are required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tracking`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    console.error('Supabase error:', data);
    return { error: data?.message || 'Supabase insert error', details: data };
  }
  return data[0];
}

export async function GET() {
  const tracking = await getTracking();
  return NextResponse.json(tracking);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tracking = await addTracking(body);
  if (!tracking || typeof tracking !== 'object') {
    return NextResponse.json({ error: 'Failed to create tracking entry' }, { status: 500 });
  }
  return NextResponse.json(tracking);
} 