# GrokVI - AI 影片生成站

使用 Next.js 建立的影片生成網站，後端依照 xAI 官方 Videos API 呼叫：`POST /v1/videos/generations`，模型為 `grok-imagine-video`。

## 1) 本機開發

安裝依賴：

```bash
npm install
```

建立環境變數檔（Windows cmd）：

```bat
copy .env.example .env.local
```

（macOS/Linux）

```bash
cp .env.example .env.local
```

填入你的金鑰後啟動：

```bash
npm run dev
```

## 2) 環境變數

- `XAI_API_KEY`：xAI API Key（建議主要使用）
- `BLAZE_API_KEY`：若使用 Blaze 代理，可作為備用 key
- `XAI_BASE_URL`：API Base URL（預設 `https://api.x.ai/v1`）

程式邏輯：優先讀取 `XAI_API_KEY`，若不存在則回退到 `BLAZE_API_KEY`。

## 3) API 端點

- `POST /api/generate`

Request body（跟隨官方 videos/generations 範例）：

```json
{
  "prompt": "a cyberpunk hong kong street, neon lights, slow dolly-in shot, cinematic, 24fps, moody lighting",
  "duration": 8,
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "reference_images": [
    { "url": "https://your-cdn.com/ref/city1.png" },
    { "url": "https://your-cdn.com/ref/city2.png" }
  ]
}
```

Response（本站 API 封裝後）：

```json
{
  "id": "video_gen_xxx",
  "status": "queued",
  "videoUrl": "https://...",
  "raw": "{...完整回應...}"
}
```

> 若 `videoUrl` 為 `null`，通常代表任務仍在處理中，請參考 `raw` / `status`。

## 4) 部署到 Vercel

1. 將專案推到 GitHub。
2. 在 Vercel 匯入 repo。
3. 在 Vercel > Project Settings > Environment Variables 設定：
   - `XAI_API_KEY`（必要）
   - `XAI_BASE_URL`（可選，預設可不填）
4. Deploy。

本專案已包含 [`vercel.json`](vercel.json)，將 [`app/api/generate/route.ts`](app/api/generate/route.ts) 的 `maxDuration` 設定為 60 秒。
