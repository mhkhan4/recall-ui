export const maxDuration = 300;

import { NextRequest } from 'next/server';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { Readable } from 'node:stream';
import type { IncomingMessage, IncomingHttpHeaders } from 'node:http';

const UPSTREAM = process.env.QUERY_SERVICE_URL ?? 'http://localhost:8002';

type RawResponse = { statusCode: number; headers: IncomingHttpHeaders; body: IncomingMessage };

function makeRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: Buffer,
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const fn = parsed.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = fn(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method,
        headers,
      },
      (res) => resolve({ statusCode: res.statusCode ?? 200, headers: res.headers, body: res }),
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const search = new URL(request.url).search;
  const url = `${UPSTREAM}/${path.join('/')}${search}`;

  const forwardHeaders: Record<string, string> = {};
  for (const [k, v] of request.headers.entries()) {
    const key = k.toLowerCase();
    if (key !== 'host' && key !== 'accept-encoding') forwardHeaders[key] = v;
  }

  const bodyBuf =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  let raw: RawResponse;
  try {
    raw = await makeRequest(url, request.method, forwardHeaders, bodyBuf);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ detail: `query-service unreachable: ${msg}` }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { statusCode, headers: upHeaders, body } = raw;
  const responseHeaders = new Headers();
  for (const [k, v] of Object.entries(upHeaders)) {
    if (v == null) continue;
    const vals = Array.isArray(v) ? v : [v];
    for (const val of vals) responseHeaders.append(k, val);
  }

  // Stream response body directly — critical for SSE (sources → tokens → done)
  return new Response(Readable.toWeb(body) as ReadableStream, {
    status: statusCode,
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
