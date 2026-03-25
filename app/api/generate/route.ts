import { NextRequest, NextResponse } from "next/server";

type ReferenceImage = {
  url: string;
};

type GenerateRequestBody = {
  prompt?: string;
  duration?: number;
  aspect_ratio?: string;
  resolution?: string;
  reference_images?: ReferenceImage[];
};

function extractVideoUrl(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const matched = value.match(/https?:\/\/\S+/);
    return matched?.[0] ?? null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractVideoUrl(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = extractVideoUrl(item);
      if (found) return found;
    }
  }

  return null;
}

function isValidReferenceImages(value: unknown): value is ReferenceImage[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).url === "string" &&
      (item as Record<string, unknown>).url.toString().trim().length > 0,
  );
}

function normalizeResponseText(data: unknown): string {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.XAI_API_KEY ?? process.env.BLAZE_API_KEY;
  const baseUrl = process.env.XAI_BASE_URL ?? "https://api.x.ai/v1";

  if (!apiKey) {
    return NextResponse.json(
      { error: "缺少 XAI_API_KEY（或 BLAZE_API_KEY）環境變數" },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as GenerateRequestBody;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "請提供 prompt" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      model: "grok-imagine-video",
      prompt,
    };

    if (typeof body.duration === "number" && Number.isFinite(body.duration)) {
      payload.duration = body.duration;
    }

    if (typeof body.aspect_ratio === "string" && body.aspect_ratio.trim()) {
      payload.aspect_ratio = body.aspect_ratio.trim();
    }

    if (typeof body.resolution === "string" && body.resolution.trim()) {
      payload.resolution = body.resolution.trim();
    }

    if (body.reference_images !== undefined) {
      if (!isValidReferenceImages(body.reference_images)) {
        return NextResponse.json(
          { error: "reference_images 格式錯誤，需為 [{ url: string }]" },
          { status: 400 },
        );
      }
      payload.reference_images = body.reference_images.map((item) => ({
        url: item.url.trim(),
      }));
    }

    const response = await fetch(`${baseUrl}/videos/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};

    if (!response.ok) {
      const errorMessage =
        (typeof data?.error === "object" &&
          data.error &&
          typeof (data.error as Record<string, unknown>).message === "string" &&
          (data.error as Record<string, unknown>).message) ||
        (typeof data?.message === "string" ? data.message : null) ||
        "影片生成失敗";

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const videoUrl =
      extractVideoUrl((data as Record<string, unknown>).videos) ??
      extractVideoUrl(data);

    return NextResponse.json(
      {
        id: (data as Record<string, unknown>).id ?? null,
        status: (data as Record<string, unknown>).status ?? null,
        videoUrl,
        raw: normalizeResponseText(data),
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知錯誤";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
