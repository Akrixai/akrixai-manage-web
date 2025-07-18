import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getPayments() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addPayment(body: any) {
  const payload = {
    project_id: typeof body.project_id === 'string' && body.project_id.trim() ? body.project_id.trim() : null,
    amount: typeof body.amount === 'number' && !isNaN(body.amount) ? body.amount : null,
    status: typeof body.status === 'string' && body.status.trim() ? body.status.trim() : null,
    payment_date: typeof body.payment_date === 'string' && body.payment_date.trim() ? body.payment_date.trim() : null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  if (!payload.project_id || payload.amount === null) {
    return { error: 'Project and amount are required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
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

async function updatePayment(id: string, body: any) {
  const payload = {
    project_id: typeof body.project_id === 'string' && body.project_id.trim() ? body.project_id.trim() : null,
    amount: typeof body.amount === 'number' && !isNaN(body.amount) ? body.amount : null,
    status: typeof body.status === 'string' && body.status.trim() ? body.status.trim() : null,
    payment_date: typeof body.payment_date === 'string' && body.payment_date.trim() ? body.payment_date.trim() : null,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
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

async function deletePayment(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export async function GET() {
  const payments = await getPayments();
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payment = await addPayment(body);
  if (!payment || typeof payment !== 'object') {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
  return NextResponse.json(payment);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updatePayment(id!, body);
  if (!updated || typeof updated !== 'object') {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deletePayment(id!);
  return NextResponse.json({ success: true });
} 