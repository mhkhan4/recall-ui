import { NextRequest } from 'next/server';

const UPSTREAM = process.env.INGEST_GATE_URL ?? 'http://localhost:8000';

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const url = `${UPSTREAM}/${path.join('/')}`;

  const headers = new Headers();
  for (const [k, v] of request.headers.entries()) {
    if (k.toLowerCase() !== 'host') headers.set(k, v);
  }

  const body = request.method === 'GET' ? undefined : await request.arrayBuffer();

  const upstream = await fetch(url, {
    method: request.method,
    headers,
    body,
    // @ts-expect-error — Node 18+ fetch duplex required for streaming bodies
    duplex: 'half',
  });

  // Stream response body directly so SSE and redirect headers pass through intact
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, (await params).path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, (await params).path);
}
