"use client";

import { FormEvent, useMemo, useState } from "react";

type GenerateResponse = {
  id: string | null;
  status: string | null;
  raw: string;
  videoUrl: string | null;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(8);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [referenceImagesText, setReferenceImagesText] = useState("");

  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const referenceImagesPreview = useMemo(
    () =>
      referenceImagesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [referenceImagesText],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim() || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const reference_images = referenceImagesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((url) => ({ url }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          resolution,
          reference_images,
        }),
      });

      const data = (await res.json()) as GenerateResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "生成失敗");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10 md:py-12">
      <section className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">GrokVI 影片生成站</h1>
          <p className="text-neutral-400">
            跟隨 xAI 官方 Videos API：<code>POST /v1/videos/generations</code>。
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="prompt" className="text-sm text-neutral-300">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="a cyberpunk hong kong street, neon lights, slow dolly-in shot, cinematic, 24fps, moody lighting"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-4 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm text-neutral-300">
                Duration（秒）
              </label>
              <input
                id="duration"
                type="number"
                min={1}
                max={30}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 8)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="aspect_ratio" className="text-sm text-neutral-300">
                Aspect Ratio
              </label>
              <select
                id="aspect_ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none focus:border-cyan-500"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="resolution" className="text-sm text-neutral-300">
                Resolution
              </label>
              <select
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none focus:border-cyan-500"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reference_images" className="text-sm text-neutral-300">
              Reference Images（每行一個 URL，可留空）
            </label>
            <textarea
              id="reference_images"
              rows={4}
              value={referenceImagesText}
              onChange={(e) => setReferenceImagesText(e.target.value)}
              placeholder="https://your-cdn.com/ref/city1.png&#10;https://your-cdn.com/ref/city2.png"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-4 outline-none focus:border-cyan-500 font-mono text-sm"
            />
            <p className="text-xs text-neutral-500">
              已輸入 {referenceImagesPreview.length} 筆參考圖
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            {loading ? "生成中..." : "生成影片"}
          </button>
        </form>

        {error ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        ) : null}

        {result ? (
          <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="text-xl font-semibold">生成結果</h2>
            <div className="text-sm text-neutral-300 space-y-1">
              <p>任務 ID：{result.id ?? "(無)"}</p>
              <p>狀態：{result.status ?? "(無)"}</p>
            </div>

            {result.videoUrl ? (
              <>
                <video
                  src={result.videoUrl}
                  controls
                  className="w-full rounded-lg border border-neutral-700"
                />
                <a
                  href={result.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg border border-cyan-500 px-4 py-2 text-cyan-300 hover:bg-cyan-500/10"
                >
                  開啟影片網址
                </a>
              </>
            ) : (
              <p className="text-amber-300">
                尚未取得影片 URL，請查看 raw 回應（可能仍在處理中）。
              </p>
            )}

            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-neutral-300">
              {result.raw}
            </pre>
          </section>
        ) : null}
      </section>
    </main>
  );
}
