import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { public_id } = await req.json();

    if (!public_id) {
      return new Response('public_id is required', { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary credentials check:');
    console.log('cloudName:', cloudName);
    console.log(
      'apiKey:',
      apiKey ? `${apiKey.substring(0, 4)}...` : 'undefined'
    );
    console.log(
      'apiSecret:',
      apiSecret ? `${apiSecret.substring(0, 4)}...` : 'undefined'
    );

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    // Create signature for Cloudinary destroy API
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      console.log(`Successfully deleted from Cloudinary: ${public_id}`);
      // Re-index photos and memories
      revalidateTag('photos-index');
      revalidateTag('memories-index');
      return new Response('Deleted', { status: 200 });
    } else {
      const errorText = await response.text();
      console.error(
        `Failed to delete from Cloudinary: ${response.status} ${errorText}`
      );
      return new Response(`Failed to delete: ${errorText}`, {
        status: response.status,
      });
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
