import { getRequestHeaders, instrument, PostHog } from "@posthog/mcp";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyApiToken } from "@/lib/auth/apiToken";
import { registerTools } from "@/lib/mcp/tools";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const posthog =
  posthogKey && posthogHost
    ? new PostHog(posthogKey, {
        host: posthogHost,
        enableExceptionAutocapture: true,
        flushAt: 1,
        flushInterval: 0,
        requestTimeout: 2000,
        fetchRetryCount: 0,
      })
    : null;

if (!posthog && process.env.NODE_ENV !== "production") {
  const missingVariable = posthogKey
    ? "NEXT_PUBLIC_POSTHOG_HOST"
    : "NEXT_PUBLIC_POSTHOG_KEY";
  console.warn(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

/**
 * The MCP endpoint for AI agents (Streamable HTTP, stateless). Agents send a
 * personal access token from /settings as `Authorization: Bearer <token>`; no
 * session cookie is involved, so this route is not in the proxy.ts matcher.
 * Every request without a valid token gets 401 before any tool runs.
 */
const mcpHandler = createMcpHandler(
  (server) => {
    if (posthog) {
      instrument(server, posthog, {
        identify: async (_request, extra) => {
          const authorization = getRequestHeaders(extra)?.authorization;
          const bearerToken = authorization?.replace(/^Bearer\s+/i, "");
          const uid = await verifyApiToken(bearerToken);
          return uid ? { distinctId: uid } : null;
        },
      });
    }
    registerTools(server);
  },
  {
    serverInfo: { name: "stay-in-touch", version: "1.0.0" },
  },
);

const authenticatedHandler = withMcpAuth(
  mcpHandler,
  async (_request, bearerToken) => {
    const uid = await verifyApiToken(bearerToken);
    if (!uid || !bearerToken) {
      return undefined;
    }
    // The uid travels to the tools in ctx.http.authInfo.extra (lib/mcp/tools.ts).
    return { token: bearerToken, clientId: uid, scopes: [], extra: { uid } };
  },
  { required: true },
);

async function handler(request: Request) {
  try {
    return await authenticatedHandler(request);
  } finally {
    if (posthog) {
      await posthog.flush().catch(() => {});
    }
  }
}

export { handler as GET, handler as POST, handler as DELETE };
