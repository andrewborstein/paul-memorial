'use client'
import useSWR from 'swr'
import TributeForm from '@/components/TributeForm'
import TributeCard from '@/components/TributeCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TributesPage() {
  const { data, mutate, isLoading } = useSWR('/api/tributes', fetcher)

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold mb-2">Share a Tribute</h1>
        <p className="text-gray-600 mb-4">Write a note or story; add photos or a YouTube link. Email is used only to send you an edit link.</p>
        <TributeForm onCreated={(t) => mutate({ items: [t, ...(data?.items||[])] }, { revalidate: true })} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Recent Tributes</h2>
        {isLoading && <div>Loading…</div>}
        {data?.items?.map((t: any) => (
          <TributeCard key={t.id} tribute={t} />
        ))}
      </section>
    </div>
  )
}
