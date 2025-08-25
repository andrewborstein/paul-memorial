'use client';

import React from 'react';

type GoFundMeIframeProps = {
  className?: string;
};

export default function GoFundMeIframe({ className }: GoFundMeIframeProps) {
  // You can add your own responsive wrapper if you want a fixed ratio instead.
  const src = `https://www.gofundme.com/f/paul-bedrosian/widget/medium`;

  return (
    <div className="w-full sm:w-[478px] h-[223px] xs:h-[173px] overflow-hidden">
      <iframe
        src={src}
        title="'GoFundMe donation widget'"
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
        }}
        className={className}
        allow="clipboard-write"
      />
    </div>
  );
}
