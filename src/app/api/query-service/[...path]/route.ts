import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = process.env.QUERY_SERVICE_URL ?? 'http://localhost:8002';

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

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  // Stream the response body directly — critical for SSE (sources → tokens → done)
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
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
