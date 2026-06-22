import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { COACH_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { checkRateLimit, MAX_REQUESTS } from "@/lib/rateLimit";
import type { GeneratedSession, SessionFormData } from "@/types/session";

export const runtime = "nodejs";

/** Best-effort client IP for rate limiting (works behind Vercel's proxy). */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Lightweight server-side validation of the incoming form payload. */
function validate(body: Partial<SessionFormData>): string | null {
  if (!body || typeof body !== "object") return "Missing request body.";
  if (!body.age || body.age < 4 || body.age > 99) return "Enter a valid age (4–99).";
  if (!body.skillLevel) return "Choose a skill level.";
  if (!body.position) return "Choose a position.";
  if (!body.numberOfPlayers || body.numberOfPlayers < 1)
    return "Number of players must be at least 1.";
  if (!body.durationMinutes || body.durationMinutes < 10)
    return "Session must be at least 10 minutes.";
  if (!body.goal) return "Choose a training goal.";
  return null;
}

export async function POST(req: NextRequest) {
  // Rate limit per IP first, to shield the OpenAI key from abuse / runaway cost.
  const rl = checkRateLimit(getClientIp(req));
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: `You've reached the limit of ${MAX_REQUESTS} sessions per hour. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: Partial<SessionFormData>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const data = body as SessionFormData;
  // Default training type for forward/backward compatibility.
  if (data.trainingType !== "Individual") data.trainingType = "Team";

  let openai;
  try {
    openai = getOpenAIClient();
  } catch {
    return NextResponse.json(
      { error: "The server is missing its OpenAI key. Please contact the site owner." },
      { status: 500 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COACH_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(data) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "The coach came back empty-handed. Please try again." },
        { status: 502 }
      );
    }

    let session: GeneratedSession;
    try {
      session = JSON.parse(content) as GeneratedSession;
    } catch {
      return NextResponse.json(
        { error: "We couldn't read the generated session. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ session });
  } catch (err: unknown) {
    console.error("[generate] OpenAI call failed:", err);
    // Map common OpenAI failures to friendly messages.
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status?: number }).status
        : undefined;

    if (status === 429) {
      return NextResponse.json(
        { error: "Too many requests right now. Wait a moment and try again." },
        { status: 429 }
      );
    }
    if (status === 401) {
      return NextResponse.json(
        { error: "The OpenAI key was rejected. Please check the server configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while building your session. Please try again." },
      { status: 500 }
    );
  }
}
