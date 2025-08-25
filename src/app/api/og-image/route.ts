import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('URL parameter is required', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract Open Graph image
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    // Extract Twitter image as fallback
    const twitterImageMatch = html.match(
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    const twitterImage = twitterImageMatch ? twitterImageMatch[1] : null;

    // Extract favicon as last resort
    const faviconMatch = html.match(
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i
    );
    const favicon = faviconMatch ? faviconMatch[1] : null;

    const image = ogImage || twitterImage || favicon;

    return new Response(JSON.stringify({ image }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching OG image:', error);
    return new Response(JSON.stringify({ image: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
