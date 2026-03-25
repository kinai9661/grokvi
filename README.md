# GrokVI - AI 影片生成站

使用 Next.js 建立的影片生成網站，後端透過 BlazeAI API 呼叫 `openai/grok-imagine-1.0-video` 模型。

## 1) 本機開發

先安裝依賴：

```bash
npm install
```

建立環境變數檔：

```bash
cp .env.example .env.local
```

將 `.env.local` 內的 `BLAZE_API_KEY` 換成你的 Key。

啟動開發伺服器：

```bash
npm run dev
```

## 2) 環境變數

- `BLAZE_API_KEY`：BlazeAI 金鑰（必填）

## 3) API 端點

- `POST /api/generate`
- Request body:

```json
{
  "prompt": "黃昏海邊，電影感鏡頭，4K"
}
```

- Response:

```json
{
  "raw": "...模型原始輸出...",
  "videoUrl": "https://..."
}
```

## 4) 部署到 Vercel

1. 將專案推到 GitHub。
2. 在 Vercel 匯入該 repo。
3. 在 Vercel 專案設定新增環境變數：`BLAZE_API_KEY`。
4. Deploy。

本專案包含 `vercel.json`，已將 `app/api/generate/route.ts` 的 `maxDuration` 設為 60 秒。
