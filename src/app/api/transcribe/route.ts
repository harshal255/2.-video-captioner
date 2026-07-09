import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Fireworks API key is not configured on the server. Please check your .env file." },
        { status: 500 }
      );
    }
    
    // Create form data payload for Fireworks AI
    const fireworksFormData = new FormData();
    fireworksFormData.append("file", file);
    fireworksFormData.append("model", "whisper-v3");

    const response = await fetch("https://api.fireworks.ai/inference/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: fireworksFormData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Fireworks transcription failed:", errText);
      return NextResponse.json({ error: "Transcription failed: " + errText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
