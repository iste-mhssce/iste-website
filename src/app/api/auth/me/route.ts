import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@lib/auth/guards";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Not signed in." },
      { status: 401 },
    );
  }
  return NextResponse.json({ user });
}