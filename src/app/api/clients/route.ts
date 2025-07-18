import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getClients() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addClient(body: any) {
  // Defensive: never send undefined, use null
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    contact: typeof body.contact === 'string' && body.contact.trim() ? body.contact.trim() : null,
    email: typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null,
  };
  if (!payload.name) {
    // Required field missing
    return { error: 'Name is required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
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

async function updateClient(id: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: body.name,
      contact: body.contact,
      email: body.email,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function deleteClient(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export async function GET() {
  const clients = await getClients();
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = await addClient(body);
  if (!client || typeof client !== 'object') {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updateClient(id!, body);
  if (!updated || typeof updated !== 'object') {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deleteClient(id!);
  return NextResponse.json({ success: true });
} 