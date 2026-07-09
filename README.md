# NovaCaption AI: Next.js + Fireworks AI Setup Guide

This guide walks you through setting up and wiring Fireworks AI into your Next.js and React project for high-performance Vision-Language tasks.

---

## 1. Get Your API Key

1. Sign up at [fireworks.ai](https://fireworks.ai) and log in.
2. Go to the [API Keys page](https://app.fireworks.ai/settings/users/api-keys) in your account settings.
3. Click **Create API key**, name it, and copy it immediately — you won't be able to see it again.
4. Store it as an environment variable in your project's `.env.local` file:
   ```bash
   FIREWORKS_API_KEY="your_api_key_here"
   ```

Fireworks AI exposes an OpenAI-compatible endpoint, which means you can use the official `openai` SDK pointed at Fireworks' base URL instead of learning a custom client.

---

## 2. Node.js (Backend / Route Handler)

Install the OpenAI SDK inside your project:
```bash
npm install openai
```

Create a client wrapper (`lib/fireworks.js`):
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export async function askFireworks(prompt) {
  const response = await client.chat.completions.create({
    model: "accounts/fireworks/models/deepseek-v3p1", // or any model from fireworks.ai/models
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content;
}
```

Run it with `FIREWORKS_API_KEY` set in your shell or `.env` file (loaded via `dotenv`).

### Streaming Completions (Better UX for Chat Apps)
```javascript
const stream = await client.chat.completions.create({
  model: "accounts/fireworks/models/deepseek-v3p1",
  messages: [{ role: "user", content: "Tell me a short story" }],
  stream: true,
});

for await (const chunk of stream) {
  const token = chunk.choices[0]?.delta?.content;
  if (token) process.stdout.write(token);
}
```

---

## 3. Next.js Integration (Route Handlers)

> [!IMPORTANT]
> **Never call Fireworks directly from client-side React** — that would expose your private API key in the browser. Instead, put the call in a secure Next.js API route (server-side), and have your React frontend call that route.

Create a route handler at `app/api/chat/route.js` (App Router):
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export async function POST(req) {
  const { message } = await req.json();

  const response = await client.chat.completions.create({
    model: "accounts/fireworks/models/deepseek-v3p1",
    messages: [{ role: "user", content: message }],
  });

  return Response.json({ reply: response.choices[0].message.content });
}
```

Put your key in `.env.local` inside the project root:
```
FIREWORKS_API_KEY=your_api_key_here
```
*(Do not prepend with `NEXT_PUBLIC_` — that leaks the key to the client browser.)*

### Streaming in Next.js (Route Handler)
```javascript
export async function POST(req) {
  const { message } = await req.json();

  const stream = await client.chat.completions.create({
    model: "accounts/fireworks/models/deepseek-v3p1",
    messages: [{ role: "user", content: message }],
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) controller.enqueue(encoder.encode(token));
      }
      controller.close();
    },
  });

  return new Response(readable);
}
```

---

## 4. React (Frontend) — Calling Your API Route

```jsx
import React, { useState } from "react";

function Chat() {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(message) {
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  }

  // ...render input + button calling sendMessage, display `reply`
}
```

If you are consuming a streaming route, read `res.body` as a `ReadableStream` on the client and append chunks as they arrive instead of waiting for `res.json()`.

---

## Key Points to Remember

* **Keep the API key server-side only** — inside Next.js API route handlers or a standalone Node/Express backend. Client-side React should only talk to your own endpoints.
* **Model Names** follow the pattern `accounts/fireworks/models/<model-name>` — browse available models on the [Fireworks Models page](https://fireworks.ai/models).
* Fireworks also provides a native Python/JS SDK and an Anthropic-compatible endpoint if you prefer Claude-style `messages.create` completions.
