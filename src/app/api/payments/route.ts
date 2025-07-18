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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      project_id: body.project_id,
      amount: body.amount,
      status: body.status,
      payment_date: body.payment_date,
      notes: body.notes,
    }),
  });
  const data = await res.json();
  return data[0];
}

async function updatePayment(id: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      project_id: body.project_id,
      amount: body.amount,
      status: body.status,
      payment_date: body.payment_date,
      notes: body.notes,
    }),
  });
  const data = await res.json();
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
  return NextResponse.json(payment);
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json();
  const updated = await updatePayment(id!, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  await deletePayment(id!);
  return NextResponse.json({ success: true });
} 