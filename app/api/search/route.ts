import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=100`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data.items)
  } catch (error) {
    console.error("Error searching developers:", error)
    return NextResponse.json({ error: "Error searching developers" }, { status: 500 })
  }
}

