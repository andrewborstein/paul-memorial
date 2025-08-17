import YouTubeEmbed from './YouTubeEmbed'

export default function TributeCard({ tribute }: { tribute: any }) {
  return (
    <article className="card">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{tribute.name}</h3>
        <time className="text-xs text-gray-500">{new Date(tribute.createdAt).toLocaleString()}</time>
      </div>
      <p className="mt-2 whitespace-pre-wrap">{tribute.body}</p>
      <div className="mt-3 grid gap-3">
        {tribute.media?.map((m: any, i: number) => (
          m.type === 'image' ? (
            <img key={i} src={m.url} alt={m.caption || ''} className="rounded-lg" />
          ) : m.type === 'video' ? (
            <video key={i} src={m.url} controls className="rounded-lg" />
          ) : null
        ))}
        {tribute.media?.some((m: any) => m.type === 'youtube') && (
          tribute.media.filter((m: any)=>m.type==='youtube').map((m:any,i:number)=>(<YouTubeEmbed key={i} url={m.url} />))
        )}
      </div>
    </article>
  )
}
