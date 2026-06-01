import { NextRequest } from 'next/server';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { Readable } from 'node:stream';
import type { IncomingMessage, IncomingHttpHeaders } from 'node:http';

const UPSTREAM = process.env.INGEST_GATE_URL ?? 'http://localhost:8000';

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

  // Drop 'host' (wrong domain) and 'accept-encoding' so the upstream never sends
  // compressed bytes — avoids content-decoding mismatches across redirect chains.
  const forwardHeaders: Record<string, string> = {};
  for (const [k, v] of request.headers.entries()) {
    const key = k.toLowerCase();
    if (key !== 'host' && key !== 'accept-encoding') forwardHeaders[key] = v;
  }

  const bodyBuf =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  // node:http never follows redirects — the browser receives the 302 + Location
  // header directly and navigates to GitHub itself.
  const { statusCode, headers: upHeaders, body } = await makeRequest(
    url,
    request.method,
    forwardHeaders,
    bodyBuf,
  );

  const responseHeaders = new Headers();
  for (const [k, v] of Object.entries(upHeaders)) {
    if (v == null) continue;
    const vals = Array.isArray(v) ? v : [v];
    for (const val of vals) responseHeaders.append(k, val);
  }

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
