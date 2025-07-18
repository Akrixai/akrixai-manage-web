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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forms`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: body.name,
      link: body.link,
      excel_link: body.excel_link,
      notes: body.notes,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function updateForm(id: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forms?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: body.name,
      link: body.link,
      excel_link: body.excel_link,
      notes: body.notes,
    }),
  });
  const data = await res.json();
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
  return NextResponse.json(form);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updateForm(id!, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deleteForm(id!);
  return NextResponse.json({ success: true });
} 