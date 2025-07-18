import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getForms() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forms?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addForm(body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    link: typeof body.link === 'string' && body.link.trim() ? body.link.trim() : null,
    excel_link: typeof body.excel_link === 'string' && body.excel_link.trim() ? body.excel_link.trim() : null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  if (!payload.name || !payload.link) {
    return { error: 'Name and link are required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forms`, {
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

async function updateForm(id: string, body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    link: typeof body.link === 'string' && body.link.trim() ? body.link.trim() : null,
    excel_link: typeof body.excel_link === 'string' && body.excel_link.trim() ? body.excel_link.trim() : null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forms?id=eq.${id}`, {
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

async function deleteForm(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/forms?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export async function GET() {
  const forms = await getForms();
  return NextResponse.json(forms);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const form = await addForm(body);
  if (!form || typeof form !== 'object') {
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
  }
  return NextResponse.json(form);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updateForm(id!, body);
  if (!updated || typeof updated !== 'object') {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deleteForm(id!);
  return NextResponse.json({ success: true });
} 