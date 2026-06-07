import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type BunFile = Blob & {
  exists: () => Promise<boolean>;
};

declare const Bun:
  | {
      file: (input: string | URL) => BunFile;
    }
  | undefined;

let serverEntryPromise: Promise<ServerEntry> | undefined;
const clientAssetsRoot = new URL("../client/", import.meta.url);

const assetContentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function getAssetContentType(pathname: string): string {
  const extensionStart = pathname.lastIndexOf(".");
  if (extensionStart === -1) return "application/octet-stream";
  return assetContentTypes[pathname.slice(extensionStart).toLowerCase()] ?? "application/octet-stream";
}

async function serveClientAsset(request: Request): Promise<Response | undefined> {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/assets/")) return undefined;

  const assetPath = pathname.replace(/^\/+/, "");
  if (assetPath.includes("..") || typeof Bun === "undefined") {
    return new Response("Bad request", { status: 400 });
  }

  const file = Bun.file(new URL(assetPath, clientAssetsRoot));
  if (!(await file.exists())) return undefined;

  return new Response(file, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": getAssetContentType(pathname),
    },
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const assetResponse = await serveClientAsset(request);
      if (assetResponse) return assetResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
