import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { eventRegisterSchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`register:${ip}`, 15)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many registration attempts" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = eventRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const data = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Event not found" },
      { status: 404 },
    );
  }

  const existing = await prisma.registration.findUnique({
    where: { eventId_email: { eventId: data.eventId, email: data.email } },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "DUPLICATE_REGISTRATION",
        message: "You are already registered for this event",
      },
      { status: 409 },
    );
  }

  const registration = await prisma.registration.create({
    data: {
      eventId: data.eventId,
      userName: data.userName,
      email: data.email,
      phone: data.phone,
      teamName: data.teamName,
    },
  });

  logApi("register", "created", { latencyMs: Date.now() - start, status: 201 });

  return NextResponse.json(
    { success: true, id: registration.id },
    { status: 201 },
  );
}
