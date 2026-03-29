import { NextRequest, NextResponse } from "next/server";

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export function verifyAdminAuth(request: NextRequest): NextResponse | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return UNAUTHORIZED;

    const secret = authHeader.replace(/^Bearer\s+/i, "");
    const expected = process.env.ADMIN_SECRET || "byu-admin-2026";

    if (secret !== expected) return UNAUTHORIZED;
    return null;
}
