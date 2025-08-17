'use client'
import useSWR from 'swr'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())
export default function MediaGrid(){
  const { data } = useSWR('/api/memories', fetcher)
  const media = (data?.items||[]).flatMap((t:any)=>t.media||[])
  if (!media.length) return <div>No media yet.</div>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {media.map((m:any,i:number)=> m.type==='image' ? (
        <img key={i} src={m.url} className="rounded-lg" />
      ) : m.type==='video' ? (
        <video key={i} src={m.url} controls className="rounded-lg" />
      ) : null)}
    </div>
  )
}
