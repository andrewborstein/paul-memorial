'use client';

import React from 'react';

type GoFundMeIframeProps = {
  className?: string;
};

export default function GoFundMeIframe({ className }: GoFundMeIframeProps) {
  // You can add your own responsive wrapper if you want a fixed ratio instead.
  const src = `https://www.gofundme.com/f/paul-bedrosian/widget/medium`;

  return (
    <div
      className="bg-white shadow-md rounded-md"
      style={{
        width: 478,
        minHeight: 174,
      }}
    >
      <iframe
        src={src}
        title="'GoFundMe donation widget'"
        loading="lazy"
        style={{
          width: 478,
          border: 0,
          minHeight: 174,
        }}
        className={className}
        allow="clipboard-write"
      />
    </div>
  );
}
