import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function updateProject(id: string, body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    client_id: typeof body.client_id === 'string' && body.client_id.trim() ? body.client_id.trim() : null,
    status: typeof body.status === 'string' && body.status.trim() ? body.status.trim() : null,
    description: typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null,
  };
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
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
    return { error: errorData?.message || 'Failed to update project' };
  }
  
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    console.error('Supabase update error:', data);
    return { error: data?.message || 'Supabase update error', details: data };
  }
  return data[0];
}

async function deleteProject(id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Supabase delete error:', errorData);
    return { error: errorData?.message || 'Failed to delete project' };
  }
  
  return { success: true };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updateProject(params.id, body);
    
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
    const result = await deleteProject(params.id);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 