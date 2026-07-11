"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-[10px] text-zinc-500 border-t border-border mt-auto bg-zinc-950/30 flex flex-col gap-2.5 items-center z-10">
      <div className="flex gap-4 flex-wrap justify-center text-zinc-500 font-sans font-medium text-[11px]">
        <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
        <span>•</span>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
        <span>•</span>
        <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <span className="opacity-0 absolute pointer-events-none w-px h-px overflow-hidden select-none">
          <span>•</span>
          <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
        </span>
      </div>
      <p className="font-sans text-zinc-500">© 2026 NovaCaption AI. All rights reserved.</p>
    </footer>
  );
}
