import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=100`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.items)
  } catch (error) {
    console.error("Error searching developers:", error)
    return NextResponse.json({ error: "Failed to search developers" }, { status: 500 })
  }
}

