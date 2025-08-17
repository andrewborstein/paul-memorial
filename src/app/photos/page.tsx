import MediaGrid from '@/components/MediaGrid'

export default function Photos() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Photos</h1>
      <p className="mb-6 text-gray-600">Browse photos & video links shared in memories.</p>
      <MediaGrid />
    </section>
  )
}
