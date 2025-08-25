'use client';

import React from 'react';

type GoFundMeIframeProps = {
  className?: string;
};

export default function GoFundMeIframe({ className }: GoFundMeIframeProps) {
  // You can add your own responsive wrapper if you want a fixed ratio instead.
  const src = `https://www.gofundme.com/f/paul-bedrosian/widget/medium`;

  return (
    <>
      <div
        className="bg-white shadow-md rounded-md block md:hidden"
        style={{
          width: '100%',
          height: 223,
          maxWidth: '100%',
        }}
      >
        <iframe
          src={src}
          title="'GoFundMe donation widget'"
          loading="lazy"
          style={{
            width: '100%',
            border: 0,
            minHeight: 223,
            maxWidth: '100%',
          }}
          className={className}
          allow="clipboard-write"
        />
      </div>
      <div
        className="bg-white shadow-md rounded-md hidden md:block"
        style={{
          width: 478,
          height: 173,
          maxWidth: 478,
        }}
      >
        <iframe
          src={src}
          title="'GoFundMe donation widget'"
          loading="lazy"
          style={{
            width: 478,
            border: 0,
            minHeight: 173,
            maxWidth: '100%',
          }}
          className={className}
          allow="clipboard-write"
        />
      </div>
    </>
  );
}
