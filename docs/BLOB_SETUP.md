# Blob Storage Setup

## Environment Variables

Add these to your `.env.local` for local development:

```env
# Dev Blob Tokens (recommended)
BLOB_READ_TOKEN=vercel_blob_rw_...  # Read-only token for dev
BLOB_WRITE_TOKEN=vercel_blob_rw_... # Write token for dev
BLOB_PREFIX=dev                     # Separate dev namespace

# Alternative: Single token (less safe)
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Token Setup

1. **Go to Vercel Dashboard** → Your Project → Storage → Blob
2. **Create tokens**:
   - Click "Create Token"
   - Name: "Dev Read Token" (Read-only)
   - Name: "Dev Write Token" (Read-write)
3. **Copy tokens** to `.env.local`

## How It Works

- **Local dev**: Uses `dev/index.json`, `dev/memories/*.json`
- **Production**: Uses `index.json`, `memories/*.json`
- **Reads**: Prefers `BLOB_READ_TOKEN`, falls back to `BLOB_READ_WRITE_TOKEN`
- **Writes**: Prefers `BLOB_WRITE_TOKEN`, falls back to `BLOB_READ_WRITE_TOKEN`

## Safety Features

- ✅ **Separate namespaces** - Dev can't overwrite prod data
- ✅ **Split tokens** - Read-only token for safer operations
- ✅ **Fallback tokens** - Works with single token if needed
- ✅ **Error handling** - Clear warnings if tokens missing

## Testing

1. Start dev server: `vercel dev`
2. Create a memory → Should write to `dev/` namespace
3. View memories → Should read from `dev/` namespace
4. Deploy to prod → Uses production namespace
