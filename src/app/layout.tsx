import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const neueKabel = localFont({
  src: [
    {
      path: "../../public/fonts/Neue_Kabel_Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Neue_Kabel_Light_Italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Neue_Kabel_Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-kabel",
});

export const metadata: Metadata = {
  title: "NovaCaption AI: Stylized Video Captioner & Storyboard Suite",
  description: "Generate high-converting viral hooks, voiceover scripts, search keywords, and multiple caption styles from video clips using Fireworks AI VLMs.",
  keywords: ["video captions", "video transcription", "storyboard generator", "viral hooks", "fireworks ai", "vlm", "nextjs app", "novacaption ai"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "NovaCaption AI: Stylized Video Captioner & Storyboard Suite",
    description: "Convert video keyframes into high-performing viral caption hooks, scripts, and hashtags in seconds.",
    url: "https://novacaption-ai.vercel.app",
    siteName: "NovaCaption AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaCaption AI: Stylized Video Captioner & Storyboard Suite",
    description: "Convert video keyframes into high-performing viral caption hooks, scripts, and hashtags in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${neueKabel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('novacaption-theme') || 'dark';
                if (saved === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontFamily: "var(--font-neue-kabel), sans-serif",
              fontSize: "13px",
            },
            success: {
              iconTheme: {
                primary: "var(--primary)",
                secondary: "var(--card)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
