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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tracking`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      action: body.action,
      details: body.details,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function updateTracking(id: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tracking?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      action: body.action,
      details: body.details,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function deleteTracking(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/tracking?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export async function GET() {
  const tracking = await getTracking();
  return NextResponse.json(tracking);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tracking = await addTracking(body);
  return NextResponse.json(tracking);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updateTracking(id!, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deleteTracking(id!);
  return NextResponse.json({ success: true });
} 