import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">GitHub Nearby</h1>
      <div className="flex space-x-4">
        <Link href="/connect" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Connect
        </Link>
        <Link href="/search" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Search
        </Link>
      </div>
    </main>
  )
}

