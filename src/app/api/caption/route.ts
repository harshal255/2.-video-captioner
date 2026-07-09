import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Helper to escape literal newlines inside double-quoted string values (common VLM JSON bug)
function sanitizeJsonString(rawJson: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < rawJson.length; i++) {
    const char = rawJson[i];
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    if (char === "\\") {
      result += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString && char === "\n") {
      result += "\\n";
      continue;
    }
    if (inString && char === "\r") {
      result += "\\r";
      continue;
    }
    result += char;
  }
  return result;
}

// Helper to systematically repair truncated JSON blocks generated due to token cutoff limits
function repairTruncatedJson(rawJson: string): string {
  let result = rawJson.trim();
  let inString = false;
  let escape = false;
  let expectingValue = false;
  const stack: string[] = [];
  let lastCommaIndex = -1;

  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
        expectingValue = false;
      } else if (char === "}" || char === "]") {
        stack.pop();
      } else if (char === ",") {
        expectingValue = false;
        lastCommaIndex = i;
      } else if (char === ":") {
        expectingValue = true;
      }
    }
  }

  // Case A: Truncated inside a double-quoted string value
  if (inString && expectingValue) {
    result += '"';
    
    // Close remaining open brackets in reverse order
    while (stack.length > 0) {
      const last = stack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
    return result;
  }

  // Case B: Truncated outside string or inside a half-written key string
  if (lastCommaIndex !== -1) {
    // Slice off the incomplete segment after the last comma
    result = result.substring(0, lastCommaIndex).trim();
    
    // Re-verify the bracket stack up to the comma to be accurate
    const freshStack: string[] = [];
    let freshInString = false;
    let freshEscape = false;
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      if (freshEscape) {
        freshEscape = false;
        continue;
      }
      if (char === "\\") {
        freshEscape = true;
        continue;
      }
      if (char === '"') {
        freshInString = !freshInString;
        continue;
      }
      if (!freshInString) {
        if (char === "{" || char === "[") {
          freshStack.push(char);
        } else if (char === "}" || char === "]") {
          freshStack.pop();
        }
      }
    }
    
    // Close the recalculated open brackets
    while (freshStack.length > 0) {
      const last = freshStack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
  } else {
    // Fallback: No comma found, just close original stack
    while (stack.length > 0) {
      const last = stack.pop();
      if (last === "{") result += "}";
      else if (last === "[") result += "]";
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { frames, model, transcript, customTone } = await request.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { error: "No video frames provided. Please extract frames before submitting." },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Fireworks API key is not configured on the server. Please check your .env.local file." },
        { status: 500 }
      );
    }

    // Default to Kimi K2.6 since it is active on the user's key
    const selectedModel = model || "accounts/fireworks/models/kimi-k2p6";

    let toneInstruction = "";
    if (customTone && customTone.trim().length > 0) {
      toneInstruction = `\n\nCRITICAL STYLE / TONE OF VOICE DIRECTION:\nThe user has requested a specific brand voice/writing style. You MUST adapt all captions ("formal", "sarcastic", "humorousTech", "humorousNonTech"), hooks, voiceover script, and description to match the following style instructions:\n"${customTone.trim()}"`;
    }

    // Format the message content with the text instructions and the base64 images
    const contentPayload: any[] = [
      {
        type: "text",
        text: `You are an expert video captioner and creative writer.
You are given a sequence of keyframes extracted chronologically from a short video clip.${transcript ? `\n\nWe have also transcribed the spoken audio dialogue from the video:\n"${transcript}"\nUse this spoken dialogue context, names, and verbal cues to align your captions with what is being said in the clip.` : ""}
Analyze these frames carefully to understand the events, environment, people, actions, and emotions.

Based on your internal analysis, generate the following content for this video:
1. "formal": A professional, clear, and objective description of what happens in the video.
2. "sarcastic": A witty, sarcastic, or mockingly critical caption about what is happening in the video.
3. "humorousTech": A funny caption tailored for programmers, developers, or tech enthusiasts (use coding terms, tech culture references, bugs, compiling, AI, etc.).
4. "humorousNonTech": A broadly funny, relatable, and humorous caption for everyday viewers.
5. "viralHooks": An array of exactly 3 high-impact, attention-grabbing text overlay hooks for the first 3 seconds of the video, based on visual hooks in the starting frames (e.g. "POV: You find a bug in prod...", "I didn't expect this...").
6. "voiceoverScript": A short, concise 2-sentence storytelling voiceover/narration script that matches the chronological flow of the storyboard keyframes.
7. "seoKeywords": An array of up to 12 highly optimized search keywords (e.g., "react debugging tips", "coding compilation error") based on the visual contents and transcript.
8. "seoHashtags": An array of exactly 5 relevant, lowercase hashtags (e.g., ["#coding", "#dev", "#programmer", "#webdev", "#javascript"]) for backward compatibility.
9. "seoDescription": A brief 2-sentence SEO-optimized description paragraph incorporating the transcript, dialogue, and keywords naturally to boost social platform search indexing.${toneInstruction}

CRITICAL FORMATTING RULES:
- Do NOT output any frame-by-frame descriptions, analysis list, or explanations in your response content. Keep your analysis entirely internal.
- Do NOT include any conversational intro, filler, or outro.
- Your entire response MUST start with '{' and end with '}'.
- Output ONLY the raw JSON object.

Your response MUST be a valid JSON object matching the following structure:
{
  "formal": "Your formal caption here.",
  "sarcastic": "Your sarcastic caption here.",
  "humorousTech": "Your humorous tech-related caption here.",
  "humorousNonTech": "Your humorous non-tech/general caption here.",
  "viralHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "voiceoverScript": "Your concise 2-sentence voiceover script narration.",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "seoHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "seoDescription": "Your brief 2-sentence SEO-optimized description paragraph here."
}`
      }
    ];

    // Append each base64 frame to the user message content
    frames.forEach((base64Frame: string) => {
      let imageUrl = base64Frame;
      if (!imageUrl.startsWith("data:image/")) {
        imageUrl = `data:image/jpeg;base64,${base64Frame}`;
      }

      contentPayload.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    });

    const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: contentPayload
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
        // response_format: { type: "json_object" } is omitted to prevent 400 errors 
        // on models/endpoints that do not support native JSON mode.
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Fireworks AI API error: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "Empty response received from the AI model." },
        { status: 500 }
      );
    }

    console.log("Raw Assistant Response:", assistantMessage);

    // Robustly extract and parse JSON object from VLM output
    let jsonContent = assistantMessage.trim();
    // 1. If it starts with markdown code blocks (e.g. ```json ...), slice them off
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    // 2. Locate the first '{' character
    const firstBrace = jsonContent.indexOf("{");
    if (firstBrace !== -1) {
      jsonContent = jsonContent.substring(firstBrace);
    }

    // 3. Repair truncation and clean multiline strings / trailing commas
    let cleanedMessage = repairTruncatedJson(jsonContent);
    cleanedMessage = sanitizeJsonString(cleanedMessage);
    cleanedMessage = cleanedMessage.replace(/,\s*([\]}])/g, "$1");

    try {
      const parsedCaptions = JSON.parse(cleanedMessage);

      // Validate structure
      if (!parsedCaptions.formal || !parsedCaptions.sarcastic || !parsedCaptions.humorousTech || !parsedCaptions.humorousNonTech) {
        throw new Error("Missing required JSON fields in AI response.");
      }

      // Safeguard optional fields in case the VLM fails to output them
      if (!parsedCaptions.viralHooks) parsedCaptions.viralHooks = [];
      if (!parsedCaptions.voiceoverScript) parsedCaptions.voiceoverScript = "";
      if (!parsedCaptions.seoKeywords) parsedCaptions.seoKeywords = [];
      if (!parsedCaptions.seoHashtags) parsedCaptions.seoHashtags = [];
      if (!parsedCaptions.seoDescription) parsedCaptions.seoDescription = "";

      return NextResponse.json({ captions: parsedCaptions });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", cleanedMessage, parseError);

      // Fallback: If it's not valid JSON, we will return the raw text to let the client handle it
      return NextResponse.json({
        rawText: assistantMessage,
        error: "Response format was not strictly JSON, showing raw output."
      });
    }

  } catch (error: any) {
    console.error("Error in caption API route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
