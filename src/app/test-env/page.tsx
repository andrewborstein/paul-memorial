export default function TestEnvPage() {
  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Environment Variables Test
      </h1>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Base URL & Environment:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NODE_ENV:</strong>
              <span className="ml-2 font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_BASE_URL:</strong>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>VERCEL_ENV:</strong>
              <span className="ml-2 font-mono">
                {process.env.VERCEL_ENV || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>VERCEL_URL:</strong>
              <span className="ml-2 font-mono">
                {process.env.VERCEL_URL || 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Data Source & Storage:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>DATA_SOURCE:</strong>
              <span className="ml-2 font-mono">
                {process.env.DATA_SOURCE || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>BLOB_PREFIX:</strong>
              <span className="ml-2 font-mono">
                {process.env.BLOB_PREFIX || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>BLOB_READ_WRITE_TOKEN:</strong>
              <span className="ml-2 font-mono">
                {process.env.BLOB_READ_WRITE_TOKEN
                  ? `${process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>BLOB_READ_TOKEN:</strong>
              <span className="ml-2 font-mono">
                {process.env.BLOB_READ_TOKEN
                  ? `${process.env.BLOB_READ_TOKEN.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>BLOB_WRITE_TOKEN:</strong>
              <span className="ml-2 font-mono">
                {process.env.BLOB_WRITE_TOKEN
                  ? `${process.env.BLOB_WRITE_TOKEN.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Notion Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NOTION_TOKEN:</strong>
              <span className="ml-2 font-mono">
                {process.env.NOTION_TOKEN
                  ? `${process.env.NOTION_TOKEN.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>NOTION_MEMORIES_DB_ID:</strong>
              <span className="ml-2 font-mono">
                {process.env.NOTION_MEMORIES_DB_ID || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>NOTION_PHOTOS_DB_ID:</strong>
              <span className="ml-2 font-mono">
                {process.env.NOTION_PHOTOS_DB_ID || 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Cloudinary Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:</strong>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:</strong>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>CLOUDINARY_API_KEY:</strong>
              <span className="ml-2 font-mono">
                {process.env.CLOUDINARY_API_KEY
                  ? `${process.env.CLOUDINARY_API_KEY.substring(0, 10)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>CLOUDINARY_API_SECRET:</strong>
              <span className="ml-2 font-mono">
                {process.env.CLOUDINARY_API_SECRET
                  ? `${process.env.CLOUDINARY_API_SECRET.substring(0, 10)}...`
                  : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Turnstile Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NEXT_PUBLIC_TURNSTILE_SITE_KEY:</strong>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
                  ? `${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.substring(0, 10)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>TURNSTILE_SECRET_KEY:</strong>
              <span className="ml-2 font-mono">
                {process.env.TURNSTILE_SECRET_KEY
                  ? `${process.env.TURNSTILE_SECRET_KEY.substring(0, 10)}...`
                  : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">GitHub Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>GITHUB_TOKEN:</strong>
              <span className="ml-2 font-mono">
                {process.env.GITHUB_TOKEN
                  ? `${process.env.GITHUB_TOKEN.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>GITHUB_OWNER:</strong>
              <span className="ml-2 font-mono">
                {process.env.GITHUB_OWNER || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>GITHUB_REPO:</strong>
              <span className="ml-2 font-mono">
                {process.env.GITHUB_REPO || 'NOT SET'}
              </span>
            </div>
            <div>
              <strong>GITHUB_BRANCH:</strong>
              <span className="ml-2 font-mono">
                {process.env.GITHUB_BRANCH || 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Security Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>ADMIN_KEY:</strong>
              <span className="ml-2 font-mono">
                {process.env.ADMIN_KEY
                  ? `${process.env.ADMIN_KEY.substring(0, 10)}...`
                  : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Turnstile Widget Test:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Should render widget:</strong>
              <span className="ml-2 font-mono">
                {!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <strong>Site key length:</strong>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.length || 0}
              </span>
            </div>
          </div>

          {/* Actual widget test */}
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="mt-4">
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
