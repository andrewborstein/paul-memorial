import Image from "next/image";

export default function Home() {
  return (
    <div className="prose max-w-none">
      <h1>Welcome</h1>
      <p>This site is a home for stories, photos, and events in memory of Paul.</p>
      <p>Please visit the <a href="/memories">Memories</a> page to share a note or story, and <a href="/photos">Photos</a> to browse photos or videos.</p>
    </div>
  )
}
