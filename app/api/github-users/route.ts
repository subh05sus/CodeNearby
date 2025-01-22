import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  const url = `https://api.github.com/search/users?q=location:${encodeURIComponent(location)}&per_page=100`
  const headers = { Accept: "application/vnd.github.v3+json" }

  try {
    const response = await fetch(url, { headers })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch GitHub users")
    }
    return NextResponse.json(data.items)
  } catch (error) {
    console.error("Error fetching GitHub users:", error)
    return NextResponse.json({ error: "Failed to fetch GitHub users" }, { status: 500 })
  }
}

