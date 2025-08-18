export default function TestEnvPage() {
  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      <h1 className="text-2xl font-semibold mb-6">Environment Variables Test</h1>
      
      <div className="space-y-4">
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
          <h2 className="font-semibold mb-2">Other Variables:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NODE_ENV:</strong> 
              <span className="ml-2 font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <strong>DATA_SOURCE:</strong> 
              <span className="ml-2 font-mono">{process.env.DATA_SOURCE}</span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:</strong> 
              <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT SET'}</span>
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
