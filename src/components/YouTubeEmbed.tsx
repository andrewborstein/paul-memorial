export default function YouTubeEmbed({ url }: { url: string }) {
  let id = ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1)
    else id = u.searchParams.get('v') || ''
  } catch {}
  if (!id) return null
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  )
}
