"use client";

import { FormEvent, useState } from "react";

type GenerateResponse = {
  raw: string;
  videoUrl: string | null;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim() || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12">
      <section className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">GrokVI 影片生成站</h1>
          <p className="text-neutral-400">
            輸入影片描述，透過 <code>openai/grok-imagine-1.0-video</code> 模型生成影片結果。
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="prompt" className="text-sm text-neutral-300">
            影片提示詞（Prompt）
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：黃昏海邊，電影感鏡頭，慢速推進，4K，16:9"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-4 outline-none focus:border-cyan-500"
          />

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
                未自動解析出影片 URL，請查看原始回應內容。
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
