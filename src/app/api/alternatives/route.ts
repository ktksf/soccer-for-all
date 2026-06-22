import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import {
  ALTERNATIVES_SYSTEM_PROMPT,
  buildAlternativesPrompt,
  type AlternativesRequest,
} from "@/lib/prompts";
import { checkRateLimit, MAX_REQUESTS } from "@/lib/rateLimit";
import type { Drill, DrillBlockType } from "@/types/session";

export const runtime = "nodejs";

const VALID_BLOCKS: DrillBlockType[] = [
  "warmup",
  "technicalDrills",
  "gameActivity",
  "conditioning",
  "coolDown",
];

/** Best-effort client IP for rate limiting (works behind Vercel's proxy). */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function validate(body: Partial<AlternativesRequest>): string | null {
  if (!body || typeof body !== "object") return "Missing request body.";
  if (!body.input || typeof body.input !== "object") return "Missing session parameters.";
  if (!body.blockType || !VALID_BLOCKS.includes(body.blockType)) return "Invalid drill section.";
  if (!body.current || !body.current.name) return "Missing the drill to replace.";
  return null;
}

export async function POST(req: NextRequest) {
  // Same per-IP rate limit as generation, to shield the OpenAI key from abuse.
  const rl = checkRateLimit(getClientIp(req));
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: `You've reached the limit of ${MAX_REQUESTS} requests per hour. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: Partial<AlternativesRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const data = body as AlternativesRequest;

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
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ALTERNATIVES_SYSTEM_PROMPT },
        { role: "user", content: buildAlternativesPrompt(data) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "The coach came back empty-handed. Please try again." },
        { status: 502 }
      );
    }

    let parsed: { alternatives?: Drill[] };
    try {
      parsed = JSON.parse(content) as { alternatives?: Drill[] };
    } catch {
      return NextResponse.json(
        { error: "We couldn't read the alternatives. Please try again." },
        { status: 502 }
      );
    }

    const alternatives = Array.isArray(parsed.alternatives) ? parsed.alternatives : [];
    if (alternatives.length === 0) {
      return NextResponse.json(
        { error: "No alternatives came back. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ alternatives });
  } catch (err: unknown) {
    console.error("[alternatives] OpenAI call failed:", err);
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

    return NextResponse.json(
      { error: "Something went wrong while finding alternatives. Please try again." },
      { status: 500 }
    );
  }
}
