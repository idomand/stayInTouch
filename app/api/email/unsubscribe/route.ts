import { NextResponse, type NextRequest } from "next/server";
import { addEmailOptOut } from "@/lib/email/optOut";

// node:crypto (token check) needs the Node.js runtime.
export const runtime = "nodejs";

/**
 * One-click unsubscribe (RFC 8058) from the List-Unsubscribe header. The mail
 * client POSTs to the URL from the header, so email and token come from the
 * query string. POST only: link scanners send GETs, and a GET must not opt
 * anyone out.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isOptedOut = await addEmailOptOut(
    searchParams.get("email"),
    searchParams.get("token"),
  );
  if (!isOptedOut) {
    return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
  }
  return NextResponse.json({ status: "ok" });
}
