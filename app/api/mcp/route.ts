import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyApiToken } from "@/lib/auth/apiToken";
import { registerTools } from "@/lib/mcp/tools";

/**
 * The MCP endpoint for AI agents (Streamable HTTP, stateless). Agents send a
 * personal access token from /settings as `Authorization: Bearer <token>`; no
 * session cookie is involved, so this route is not in the proxy.ts matcher.
 * Every request without a valid token gets 401 before any tool runs.
 */
const mcpHandler = createMcpHandler(registerTools, {
  serverInfo: { name: "stay-in-touch", version: "1.0.0" },
});

const handler = withMcpAuth(
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

export { handler as GET, handler as POST, handler as DELETE };
