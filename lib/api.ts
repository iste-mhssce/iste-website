import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export function errorResponse(error: unknown, status = 400) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message },
    { status },
  );
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
