import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getProjects() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addProject(body: any) {
  const payload = {
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null,
    client_id: typeof body.client_id === 'string' && body.client_id.trim() ? body.client_id.trim() : null,
    status: typeof body.status === 'string' && body.status.trim() ? body.status.trim() : null,
    description: typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null,
  };
  if (!payload.name) {
    return { error: 'Name is required' };
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
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

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await addProject(body);
  if (!project || typeof project !== 'object') {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
  return NextResponse.json(project);
} 