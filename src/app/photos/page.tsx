import MediaGrid from '@/components/MediaGrid'

export default function Memories() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Memories</h1>
      <p className="mb-6 text-gray-600">Browse photos & video links shared in tributes.</p>
      <MediaGrid />
    </section>
  )
}
