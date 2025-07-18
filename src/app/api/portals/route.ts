import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getPortals() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portals?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addPortal(body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    link: typeof body.link === 'string' && body.link.trim() ? body.link.trim() : null,
    credentials: body.credentials ?? null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  if (!payload.name || !payload.link) {
    return { error: 'Name and link are required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portals`, {
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

async function updatePortal(id: string, body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    link: typeof body.link === 'string' && body.link.trim() ? body.link.trim() : null,
    credentials: body.credentials ?? null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portals?id=eq.${id}`, {
    method: "PATCH",
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
    return { error: data?.message || 'Supabase update error', details: data };
  }
  return data[0];
}

async function deletePortal(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/portals?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export async function GET() {
  const portals = await getPortals();
  return NextResponse.json(portals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const portal = await addPortal(body);
  if (!portal || typeof portal !== 'object') {
    return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 });
  }
  return NextResponse.json(portal);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updatePortal(id!, body);
  if (!updated || typeof updated !== 'object') {
    return NextResponse.json({ error: 'Failed to update portal' }, { status: 500 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deletePortal(id!);
  return NextResponse.json({ success: true });
} 