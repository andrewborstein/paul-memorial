import React from 'react';

interface LinkifiedTextProps {
  text: string;
  className?: string;
  disableLinks?: boolean; // When true, don't render clickable links (for use inside Link components)
}

/**
 * Component that converts URLs in text to clickable links while preserving formatting
 */
export default function LinkifiedText({
  text,
  className = '',
}: LinkifiedTextProps) {
  if (!text) return null;

  // Common TLDs that we want to auto-link
  const commonTlds = ['com', 'org', 'net', 'io', 'co'];

  // Build regex pattern with common TLDs
  const tldPattern = commonTlds.join('|');
  const urlRegex = new RegExp(
    `(https?://[^\\s]+|(?:www\\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\\.(?:${tldPattern})(?:/[^\\s]*)?)`,
    'g'
  );

  const parts = text.split(urlRegex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Add https:// if no protocol is present
          const href = part.startsWith('http') ? part : `https://${part}`;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </div>
  );
}

// Test the regex pattern
export function testUrlRegex() {
  const testText =
    'Check out these sites: https://example.com, http://test.org, www.facebook.com, facebook.com, and github.com/user/repo';

  // Common TLDs that we want to auto-link
  const commonTlds = ['com', 'org', 'net', 'io', 'co'];

  const tldPattern = commonTlds.join('|');
  const urlRegex = new RegExp(
    `(https?://[^\\s]+|(?:www\\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\\.(?:${tldPattern})(?:/[^\\s]*)?)`,
    'g'
  );

  const matches = testText.match(urlRegex);
  console.log('URL regex test:', matches); // Should log: ['https://example.com', 'http://test.org', 'www.facebook.com', 'facebook.com', 'github.com/user/repo']
  return matches;
}
