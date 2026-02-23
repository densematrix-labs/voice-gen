# Voice Gen — Free ElevenLabs Alternative

AI Text to Speech Generator. Convert text to natural voice audio instantly.

## Features

- 🚀 **Lightning Fast** — Generate speech in seconds
- 🌍 **Multilingual** — Support for multiple languages
- 💰 **Free to Start** — 10 free generations per day
- 🎨 **6 Unique Voices** — Choose from diverse voice styles

## Tech Stack

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Python FastAPI
- **TTS API**: OpenAI TTS
- **Deployment**: Docker

## Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deployment

```bash
docker compose up -d --build
```

## Environment Variables

```env
OPENAI_API_KEY=your_key
LLM_PROXY_URL=https://llm-proxy.densematrix.ai
LLM_PROXY_KEY=your_proxy_key
CREEM_API_KEY=your_creem_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_PRODUCT_IDS={"voice_gen_starter":"prod_xxx"}
```

## License

MIT
