# Migration Plan: Notion → Vercel Blob Architecture

## Overview

Migrate from Notion API to Vercel Blob storage for better performance, simplicity, and control. This plan maintains all current functionality while eliminating API rate limits and complexity.

## Phase 1: Setup & Dependencies

### 1.1 Install New Dependencies

```bash
npm install @vercel/blob nanoid p-limit
npm install --save-dev @types/nanoid
```

### 1.2 Update Environment Variables

```env
# Remove Notion variables
# NOTION_TRIBUTES_DB_ID
# NOTION_PHOTOS_DB_ID
# NOTION_API_KEY

# Keep existing Cloudinary variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset

# Keep existing Turnstile variables
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
```

### 1.3 Create Type Definitions

Create `/types/memory.ts` with the new data structures:

- `MemoryIndexItem` - For list views
- `MemoryDetail` - For full memory pages
- `MemoryPhoto` - For photo metadata

## Phase 2: Core Infrastructure

### 2.1 Create Blob Data Layer

Create `/lib/data.ts` with:

- `readBlobJson()` - Read JSON from Blob
- `writeBlobJson()` - Write JSON to Blob
- `readIndex()` - Get memory list
- `writeIndex()` - Update memory list
- `readMemory()` - Get single memory
- `writeMemory()` - Save single memory

### 2.2 Update Cloudinary Utilities

Enhance `/lib/cloudinary.ts` with:

- `cldUrl()` - Generate optimized URLs
- Keep existing `publicIdToUrl()` for compatibility
- Add width/height/crop parameters

### 2.3 Create New API Routes

- `/api/memories/route.ts` - GET memory list (cached)
- `/api/memory/route.ts` - POST create memory
- `/api/memory/[id]/route.ts` - GET single memory (cached)

## Phase 3: Form & Upload System

### 3.1 Create New Memory Form

Create `/components/CreateMemoryForm.tsx` with:

- File selection with preview
- Concurrent uploads to Cloudinary (4 at a time)
- Progress tracking per file
- Drag-and-drop reordering
- Form validation
- Turnstile integration

### 3.2 Update Upload Flow

- Client uploads directly to Cloudinary
- Server only stores `public_id`, `caption`, `sort_index`
- No file size limits on server
- Immediate feedback with progress bars

## Phase 4: Page Updates

### 4.1 Update Memory List Page

Modify `/app/memories/page.tsx`:

- Use new `/api/memories` endpoint
- Display `MemoryIndexItem[]` data
- Keep existing UI/UX
- Add caching headers

### 4.2 Update Memory Detail Page

Modify `/app/memories/[id]/page.tsx`:

- Use new `/api/memory/[id]` endpoint
- Display `MemoryDetail` data
- Keep existing photo grid
- Add caching headers

### 4.3 Update Photo Pages

Modify photo-related pages:

- `/app/photos/page.tsx`
- `/app/memories/photos/page.tsx`
- Use new data structure
- Keep existing navigation

### 4.4 Update Home Page

Modify `/app/page.tsx`:

- Use new API endpoints
- Keep existing layout
- Add caching

## Phase 5: Remove Notion Dependencies

### 5.1 Remove Notion Files

Delete or archive:

- `/lib/notion.ts`
- `/lib/memories.ts` (after migration)
- `/lib/photos.ts` (after migration)

### 5.2 Update Imports

Replace all Notion imports with new data layer:

- `@/lib/notion` → `@/lib/data`
- `@/lib/memories` → `@/lib/data`
- `@/lib/photos` → `@/lib/data`

### 5.3 Remove Old API Routes

Delete:

- `/api/submit-memory/route.ts`
- `/api/create-photo/route.ts`
- `/api/memories/[id]/route.ts` (old version)

## Phase 6: Testing & Validation

### 6.1 Test Core Functionality

- [ ] Memory creation with photos
- [ ] Memory list display
- [ ] Memory detail pages
- [ ] Photo galleries
- [ ] Navigation between pages

### 6.2 Test Performance

- [ ] Page load times < 500ms
- [ ] Photo uploads work concurrently
- [ ] Caching headers are set correctly
- [ ] No API rate limit errors

### 6.3 Test Edge Cases

- [ ] Large photo uploads
- [ ] Network failures during upload
- [ ] Invalid data handling
- [ ] Turnstile verification

## Phase 7: Deployment & Cleanup

### 7.1 Deploy to Vercel

- Push changes to main branch
- Verify Vercel Blob is configured
- Test all functionality in production

### 7.2 Monitor & Optimize

- Check Vercel analytics for performance
- Monitor error rates
- Optimize image sizes if needed

### 7.3 Clean Up

- Remove unused environment variables
- Archive old Notion files
- Update documentation

## Implementation Order

1. **Start with Phase 1** - Setup dependencies and types
2. **Phase 2** - Build the data layer foundation
3. **Phase 3** - Create the new form system
4. **Phase 4** - Update pages one by one
5. **Phase 5** - Remove old dependencies
6. **Phase 6** - Comprehensive testing
7. **Phase 7** - Deploy and cleanup

## Risk Mitigation

### Rollback Plan

- Keep Notion code in separate branch
- Can revert to Notion API if needed
- No data loss (Cloudinary files remain)

### Testing Strategy

- Implement alongside existing system
- Test thoroughly before removing Notion
- Gradual rollout with feature flags

### Data Safety

- All photos stored in Cloudinary (safe)
- JSON data in Vercel Blob (backed up)
- No data migration needed

## Success Criteria

- [ ] Page load times < 500ms (vs current 1-3s)
- [ ] No API rate limit errors
- [ ] All existing functionality preserved
- [ ] Photo uploads work smoothly
- [ ] Caching working correctly
- [ ] No breaking changes to UX

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (infrastructure)
- **Phase 3**: 3-4 hours (form system)
- **Phase 4**: 2-3 hours (page updates)
- **Phase 5**: 1 hour (cleanup)
- **Phase 6**: 2 hours (testing)
- **Phase 7**: 1 hour (deployment)

**Total: ~12-15 hours** (can be done over 2-3 days)

## Questions for You

1. **Priority**: Should we implement this alongside the current system or replace it directly?

2. **Testing**: Do you want to test each phase individually or implement everything and test at the end?

3. **UI Changes**: Should we keep the exact same UI/UX or take this opportunity to improve it?

4. **Deployment**: Should we deploy to a staging environment first or go straight to production?

5. **Timeline**: What's your preferred timeline for this migration?
