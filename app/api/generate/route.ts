import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://blazeai.boxu.dev/api/v1",
  apiKey: process.env.BLAZE_API_KEY,
});

function extractVideoUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const match = value.match(/https?:\/\/\S+/);
    return match?.[0] ?? null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractVideoUrl(item);
      if (found) return found;
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = extractVideoUrl(item);
      if (found) return found;
    }
  }

  return null;
}

function stringifyContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (content === undefined || content === null) {
    return "";
  }

  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.BLAZE_API_KEY) {
    return NextResponse.json(
      { error: "缺少 BLAZE_API_KEY 環境變數" },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "請提供 prompt" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "openai/grok-imagine-1.0-video",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices?.[0]?.message?.content;
    const raw = stringifyContent(content);
    const videoUrl = extractVideoUrl(content ?? raw);

    return NextResponse.json(
      {
        raw,
        videoUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
