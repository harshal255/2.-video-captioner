import React from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  label?: string;
  className?: string;
}

export default function AdBanner({
  slot = "0000000000",
  format = "auto",
  className = ""
}: AdBannerProps) {
  return (
    <div className={`w-full my-2 flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}>
      <div className="w-full max-w-4xl flex items-center justify-center text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense Publisher ID
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
