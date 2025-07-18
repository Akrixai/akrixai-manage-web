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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portals`, {
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
      credentials: body.credentials,
      notes: body.notes,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function updatePortal(id: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/portals?id=eq.${id}`, {
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
      credentials: body.credentials,
      notes: body.notes,
    }),
  });
  const data = await res.json();
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
  return NextResponse.json(portal);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updatePortal(id!, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deletePortal(id!);
  return NextResponse.json({ success: true });
} 