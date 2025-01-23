import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const location = searchParams.get("location")

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://api.github.com/search/users?q=location:${encodeURIComponent(location)}&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.items)
  } catch (error) {
    console.error("Error fetching developers:", error)
    return NextResponse.json({ error: "Failed to fetch developers" }, { status: 500 })
  }
}

