import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Supabase update error:', errorData);
    return { error: errorData?.message || 'Failed to update payment' };
  }
  
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    console.error('Supabase update error:', data);
    return { error: data?.message || 'Supabase update error', details: data };
  }
  return data[0];
}

async function deletePayment(id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Supabase delete error:', errorData);
    return { error: errorData?.message || 'Failed to delete payment' };
  }
  
  return { success: true };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updatePayment(params.id, body);
    
    if (updated.error) {
      return NextResponse.json({ error: updated.error }, { status: 400 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deletePayment(params.id);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 