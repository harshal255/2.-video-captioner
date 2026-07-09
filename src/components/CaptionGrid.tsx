"use client";

import React, { useState } from "react";
import { Copy, Check, AlertCircle, MessageSquare, Sparkles, Clapperboard, Tag, Hash, TrendingUp } from "lucide-react";

interface Captions {
  formal: string;
  sarcastic: string;
  humorousTech: string;
  humorousNonTech: string;
  viralHooks?: string[];
  voiceoverScript?: string;
  seoKeywords?: string[];
  seoHashtags?: string[];
  seoDescription?: string;
}

interface CaptionGridProps {
  captions: Captions | null;
  rawText?: string | null;
}

export default function CaptionGrid({ captions, rawText }: CaptionGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!captions && !rawText) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getFullMarkdown = () => {
    if (rawText && !captions) return rawText;
    if (!captions) return "";
    let md = `### 🎬 NovaCaption AI Generation Results

* **Formal Description:**
  > ${captions.formal}

* **Sarcastic Commentary:**
  > ${captions.sarcastic}

* **Humorous (Tech / Developer):**
  > ${captions.humorousTech}

* **Humorous (General / Relatable):**
  > ${captions.humorousNonTech}`;

    if (captions.viralHooks && captions.viralHooks.length > 0) {
      md += `\n\n* **Viral Hooks (First 3s):**\n` + captions.viralHooks.map((h, i) => `  ${i + 1}. "${h}"`).join("\n");
    }

    if (captions.voiceoverScript) {
      md += `\n\n* **30s Cinematic Voiceover Script:**\n  > ${captions.voiceoverScript}`;
    }

    return md;
  };

  const copyFullMarkdown = () => {
    const text = getFullMarkdown();
    copyToClipboard(text, "full");
  };

  // If the VLM returned an unstructured raw text string
  if (rawText && !captions) {
    return (
      <div className="w-full mt-8 animate-in fade-in duration-300" id="chatbot-response-container">
        <div className="w-full bg-zinc-950/45 border border-zinc-900/80 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4">

          {/* Chatbot Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
                  Assistant Response
                </span>
                <p className="text-[9px] text-zinc-500 font-medium">Unstructured Output</p>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(rawText, "raw")}
              className="p-1.5 rounded-lg border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              id="btn-copy-raw"
            >
              {copiedId === "raw" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          {/* Chatbot Text Bubble */}
          <div className="flex gap-2.5 items-start text-zinc-400 text-[11px] bg-rose-950/10 border border-rose-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>
              The model did not return a valid JSON structure. Showing the raw assistant message below:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900/80 text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {rawText}
          </div>
        </div>
      </div>
    );
  }

  if (!captions) return null;

  const captionSections = [
    {
      id: "formal",
      title: "Formal Description",
      content: captions.formal,
      description: "An objective, professional summary of the video content.",
      accentBorder: "border-l-blue-500/80",
      accentText: "text-blue-400"
    },
    {
      id: "sarcastic",
      title: "Sarcastic Commentary",
      content: captions.sarcastic,
      description: "Witty, dry, and mockingly critical observations.",
      accentBorder: "border-l-rose-500/80",
      accentText: "text-rose-400"
    },
    {
      id: "humorousTech",
      title: "Humorous (Tech / Developer)",
      content: captions.humorousTech,
      description: "Tailored for coders—referencing bugs, algorithms, and tech culture.",
      accentBorder: "border-l-amber-500/80",
      accentText: "text-amber-400"
    },
    {
      id: "humorousNonTech",
      title: "Humorous (General / Relatable)",
      content: captions.humorousNonTech,
      description: "Universally funny, everyday observations for general audiences.",
      accentBorder: "border-l-emerald-500/80",
      accentText: "text-emerald-400"
    }
  ];

  return (
    <div className="w-full mt-8 animate-in fade-in duration-300" id="chatbot-response-container">
      <div className="w-full bg-zinc-950/45 border border-zinc-900/80 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-5">

        {/* Chatbot Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
                NovaCaption Assistant
              </span>
            </div>
          </div>

          <button
            onClick={copyFullMarkdown}
            className="p-1.5 px-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/90 text-muted-foreground text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:border-emerald-500/20 active:scale-95"
            title="Copy entire response as markdown"
            id="btn-copy-full"
          >
            {copiedId === "full" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Full Response Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Response</span>
              </>
            )}
          </button>
        </div>

        {/* Chatbot Response Body - Structured List of Categories */}
        <div className="flex flex-col gap-5">
          {captionSections.map((sec) => (
            <div key={sec.id} className="flex flex-col gap-1.5" id={`section-${sec.id}`}>

              {/* Category Subheader */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-xs font-bold tracking-wide uppercase ${sec.accentText}`}>
                    {sec.title}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-sans mt-0.5">{sec.description}</span>
                </div>

                {/* Category-specific Copy Button */}
                <button
                  onClick={() => copyToClipboard(sec.content, sec.id)}
                  className="p-1 rounded bg-secondary/40 hover:bg-secondary border border-border text-muted-foreground transition-all flex items-center gap-1 text-[9px] cursor-pointer"
                  title={`Copy ${sec.title}`}
                  id={`btn-copy-${sec.id}`}
                >
                  {copiedId === sec.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chatbot Quote block for content */}
              <div className={`border-l-2 bg-secondary/70 p-3.5 rounded-r-xl rounded-bl-xl border-border ${sec.accentBorder} shadow-sm`}>
                <p className="text-foreground text-base md:text-[17px] leading-relaxed font-sans font-medium italic select-text">
                  "{sec.content}"
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Section 2: Viral Hooks & Teleprompter Voiceover Script */}
        {((captions.viralHooks && captions.viralHooks.length > 0) || captions.voiceoverScript) && (
          <div className="border-t border-border/60 pt-5 mt-3 flex flex-col gap-4 animate-in fade-in duration-300" id="section-hooks-script">

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column: Viral Hooks */}
              {captions.viralHooks && captions.viralHooks.length > 0 && (
                <div className="flex flex-col gap-2.5" id="container-viral-hooks">
                  <div className="flex items-center gap-2">
                    <div className="w-5.5 h-5.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Viral Text Hooks
                      </span>
                      <span className="text-[9px] text-zinc-500 font-sans mt-0.5">High-converting text overlays for the first 3s</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-1">
                    {captions.viralHooks.map((hook, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 bg-secondary/80 border border-border rounded-xl p-3 shadow-inner hover:border-border/80 transition-colors group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground shrink-0 mt-0.5 shadow-sm">
                            {i + 1}
                          </span>
                          <p className="text-foreground text-xs md:text-sm font-sans font-semibold italic leading-relaxed select-text">
                            "{hook}"
                          </p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(hook, `hook-${i}`)}
                          className="p-1 rounded bg-secondary/40 hover:bg-secondary border border-border text-muted-foreground transition-colors cursor-pointer"
                          title="Copy hook"
                          id={`btn-copy-hook-${i}`}
                        >
                          {copiedId === `hook-${i}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Right Column: Voiceover Script */}
              {captions.voiceoverScript && (
                <div className="flex flex-col gap-2.5" id="container-voiceover-script">
                  <div className="flex items-center gap-2">
                    <div className="w-5.5 h-5.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Clapperboard className="w-3 h-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-sans">
                        30s Narration Script
                      </span>
                      <span className="text-[9px] text-zinc-500 font-sans mt-0.5">Storytelling voiceover script based on keyframes</span>
                    </div>
                  </div>

                  <div className="relative bg-secondary/80 border border-border rounded-xl p-4 shadow-inner flex flex-col justify-between hover:border-border/80 transition-colors mt-1">
                    <p className="text-foreground/90 text-xs md:text-sm leading-relaxed font-sans font-medium whitespace-pre-wrap select-text italic pb-2">
                      "{captions.voiceoverScript}"
                    </p>

                    <div className="flex justify-end mt-2 pt-3 border-t border-border/60">
                      <button
                        onClick={() => copyToClipboard(captions.voiceoverScript!, "voiceover")}
                        className="p-1 px-2.5 rounded bg-secondary hover:bg-secondary/85 border border-border text-muted-foreground transition-colors flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                        title="Copy entire script"
                        id="btn-copy-voiceover"
                      >
                        {copiedId === "voiceover" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied Script</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Section 3: AI Keywords & Search SEO Optimizer */}
        {((captions.seoKeywords && captions.seoKeywords.length > 0) || captions.seoDescription) && (
          <div className="border-t border-zinc-900/60 pt-5 mt-3 flex flex-col gap-4 animate-in fade-in duration-300" id="section-seo-optimizer">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
                AI Keywords & Search SEO Optimizer
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {/* Description Card */}
              {captions.seoDescription && (
                <div className="flex flex-col gap-2" id="container-seo-description">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-350 font-sans">
                        SEO-Optimized Description
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(captions.seoDescription!, "seodescription")}
                      className="p-1 px-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-450 hover:text-zinc-250 transition-colors flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                      title="Copy description"
                      id="btn-copy-seo-description"
                    >
                      {copiedId === "seodescription" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Description</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-secondary/85 border border-border rounded-xl p-3.5 shadow-inner">
                    <p className="text-foreground/90 text-xs md:text-sm leading-relaxed font-sans select-text">
                      {captions.seoDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Keywords & Hashtags side-by-side or stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Keywords Tag Cloud - Spans 2 columns */}
                {captions.seoKeywords && captions.seoKeywords.length > 0 && (
                  <div className="lg:col-span-2 flex flex-col gap-2.5" id="container-seo-keywords">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                          <Tag className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground/95 font-sans">
                          Search Keywords (Up to 30)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const list = captions.seoKeywords!.join(", ");
                          copyToClipboard(list, "seokeywords");
                        }}
                        className="p-1 px-2 rounded bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground transition-colors flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                        title="Copy all keywords as comma-separated list"
                        id="btn-copy-seo-keywords"
                      >
                        {copiedId === "seokeywords" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied List</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy List</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-secondary/85 border border-border max-h-[140px] overflow-y-auto shadow-inner">
                      {captions.seoKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-sans font-medium text-foreground bg-secondary/45 border border-border rounded-md hover:border-foreground/30 hover:text-foreground transition-colors select-all cursor-default"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags Column - Spans 1 column */}
                {captions.seoHashtags && captions.seoHashtags.length > 0 && (
                  <div className="flex flex-col gap-2.5" id="container-seo-hashtags">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                          <Hash className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground/95 font-sans">
                          Hashtags (5)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const list = captions.seoHashtags!.join(" ");
                          copyToClipboard(list, "seohashtags");
                        }}
                        className="p-1 px-2 rounded bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground transition-colors flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                        title="Copy all hashtags"
                        id="btn-copy-seo-hashtags"
                      >
                        {copiedId === "seohashtags" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy All</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/85 border border-border shadow-inner h-[140px] justify-center">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {captions.seoHashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-[11px] font-mono font-bold text-primary bg-primary/5 border border-primary/20 rounded-lg select-all cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
